import axios from "axios";
import Attendance from "../../models/Student/Attendance.js";
import ThreadService from "../../services/threadService.js";
import logger from "../../utils/logger.js";
import AppError from "../../utils/appError.js";

const threadService = new ThreadService();

const MINIMUM_ATTENDANCE_CRITERIA = 75;
const BASE_URL = process.env.PYTHON_API;
const BACKEND_URL = process.env.BACKEND_HOST || 'http://localhost:8000';

const sendAttendanceReport = async (attendanceData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/generate_attendance_report`,
      {
        attendanceData,
      }
    );

    if (response.status !== 200) {
      throw new Error(`Error sending attendance report: ${response.data}`);
    }
  } catch (error) {
    logger.error("Error creating user", {
      error: error.message,
      stack: error.stack,
    });
    throw new Error(`Error sending attendance report: ${error}`);
  }
};

export const checkMinimumAttendance = async (userId, semester, month, subjects) => { 
  if (!subjects) {
    throw new Error("Subjects array is undefined");
  }
    const totalClasses = subjects.reduce((acc, subject) => acc + (subject.totalClasses || 0), 0);
    const attendedClasses = subjects.reduce((acc, subject) => acc + (subject.attendedClasses || 0), 0);

    console.log("Total Classes:", totalClasses, "Attended Classes:", attendedClasses);

    if (totalClasses === 0) {
        return 0;
    }

    const overallAttendance = (attendedClasses / totalClasses) * 100;
    console.log("Overall Attendance:", overallAttendance);

    if (overallAttendance < MINIMUM_ATTENDANCE_CRITERIA) {
        try {
          // Get the mentor of the student
          const mentorUrl = `${BACKEND_URL}/api/mentorship/mentor/${userId}`;
          console.log("Fetching mentor details from:", mentorUrl);
          
          const mentordetails = await axios.get(mentorUrl);
          console.log("Mentor Details: ", mentordetails);
          
          if (mentordetails.data?.mentor?._id) {
            const mentorId = mentordetails.data.mentor._id;
            console.log("Mentor: ", mentorId);
            await threadService.createThread(
                mentorId,
                [userId, mentorId],
                `Attendance issue for month ${month} in semester ${semester}`,
                "attendance"
            );
            logger.info("SENDING REPORT");
          } else {
            logger.warn("No mentor found for student:", userId);
          }
        } catch (error) {
            console.error("Error in checkMinimumAttendance:", error);
            // Don't throw the error, just log it and continue
            logger.error("Error fetching mentor details", {
              error: error.message,
              userId,
              semester,
              month
            });
        }
    }
    return overallAttendance;
};

export const submitAttendanceData = async (req, res) => {
  console.log("User ID received:", req.params.userId);
  console.log("Request body:", req.body);
  try {
    const { semester, month, subjects } = req.body;
    const userId = req.params.userId;

    if (!semester || !month || !subjects) {
        return res.status(400).json({ message: "Missing required fields (semester, month, subjects)" });
    }

    // Validate that each subject has a subjectCode
    if (!subjects.every(subject => subject.subjectCode)) {
        return res.status(400).json({ message: "Each subject must have a subject code" });
    }

    let overallAttendance;
    try {
      overallAttendance = await checkMinimumAttendance(userId, semester, month, subjects);
    }
    catch (error) {
      console.error("Error in checkMinimumAttendance:", error);
      return res.status(400).json({ message: "Error checking attendance: " + error.message });
    }

    // Prepare the subjects data with required fields
    const formattedSubjects = subjects.map(subject => ({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      attendedClasses: subject.attendedClasses,
      totalClasses: subject.totalClasses
    }));

    // Try to find existing attendance record
    let attendance = await Attendance.findOne({ userId });

    if (!attendance) {
      // Create new attendance record
      attendance = new Attendance({
        userId,
        semesters: [{
          semester,
          months: [{
            month,
            subjects: formattedSubjects,
            overallAttendance
          }]
        }]
      });
    } else {
      // Find or create semester
      let semesterObj = attendance.semesters.find(s => s.semester === semester);
      
      if (!semesterObj) {
        // Create new semester
        semesterObj = {
          semester,
          months: [{
            month,
            subjects: formattedSubjects,
            overallAttendance
          }]
        };
        attendance.semesters.push(semesterObj);
      } else {
        // Find or create month
        let monthObj = semesterObj.months.find(m => m.month === month);
        
        if (!monthObj) {
          // Create new month
          monthObj = {
            month,
            subjects: formattedSubjects,
            overallAttendance
          };
          semesterObj.months.push(monthObj);
        } else {
          // Update existing month
          // Ensure all existing subjects have subject codes
          const updatedSubjects = monthObj.subjects.map(subject => {
            if (!subject.subjectCode) {
              // Find matching subject from new data
              const matchingSubject = formattedSubjects.find(
                s => s.subjectName === subject.subjectName
              );
              return {
                ...subject,
                subjectCode: matchingSubject?.subjectCode || 'UNKNOWN'
              };
            }
            return subject;
          });

          // Add any new subjects
          formattedSubjects.forEach(newSubject => {
            const existingSubject = updatedSubjects.find(
              s => s.subjectCode === newSubject.subjectCode
            );
            if (!existingSubject) {
              updatedSubjects.push(newSubject);
            }
          });

          monthObj.subjects = updatedSubjects;
          monthObj.overallAttendance = overallAttendance;
        }
      }
    }

    // Save the attendance record
    try {
      const savedAttendance = await attendance.save();
      res.status(200).json({
        status: "success",
        data: { attendance: savedAttendance },
      });
    } catch (saveError) {
      console.error("Error saving attendance:", saveError);
      // If there's a validation error, try to fix the data and save again
      if (saveError.name === 'ValidationError') {
        try {
          // Ensure all subjects in all semesters and months have subject codes
          attendance.semesters.forEach(semester => {
            semester.months.forEach(month => {
              month.subjects = month.subjects.map(subject => {
                if (!subject.subjectCode) {
                  return {
                    ...subject,
                    subjectCode: 'UNKNOWN'
                  };
                }
                return subject;
              });
            });
          });
          
          const savedAttendance = await attendance.save();
          res.status(200).json({
            status: "success",
            data: { attendance: savedAttendance },
          });
        } catch (retryError) {
          console.error("Error in retry save:", retryError);
          return res.status(400).json({ 
            message: "Error saving attendance data after retry",
            error: retryError.message 
          });
        }
      } else {
        return res.status(400).json({ 
          message: "Error saving attendance data",
          error: saveError.message 
        });
      }
    }

  } catch (error) {
    console.error("Error in submitAttendanceData:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const getAttendanceById = async (req, res, next) => {
  const { id } = req.params;

  const attendance = await Attendance.findOne({ userId: id });

  if (!attendance) {
    return next(new AppError("Attendance not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      attendance, // Return the entire attendance document
    },
  });
};

//This is for testing purposes, we want to quickly delete data

export const deleteAllAttendance = async (req, res) => {
  const userId = req.params.userId;

  // Use Mongoose to delete all attendance records with the specified user ID
  const result = await Attendance.deleteMany({ userId: userId });

  if (result.deletedCount === 0) {
    return res
      .status(400)
      .json({ message: "No attendance records found for user ID" });
  }

  res
    .status(204)
    .json({ message: "All attendance records deleted successfully" });
};
