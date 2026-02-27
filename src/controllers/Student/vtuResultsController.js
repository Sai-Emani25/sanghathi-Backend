import VTUResults from "../../models/Student/VTUResults.js";
import StudentProfile from "../../models/Student/Profile.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/appError.js";

/**
 * Get VTU Results for a student
 */
export const getVTUResults = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const vtuResults = await VTUResults.findOne({ userId }).populate("userId");

  if (!vtuResults) {
    return next(new AppError("VTU results not found for this student", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      vtuResults,
    },
  });
});

/**
 * Add or update VTU results for a student
 * This endpoint allows students to add their semester results manually
 */
export const addVTUResults = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { usn, semesterData } = req.body;

  // Validate USN format
  if (!usn || usn.length < 10) {
    return next(new AppError("Invalid USN format", 400));
  }

  // Validate semester data
  if (!semesterData || !Array.isArray(semesterData)) {
    return next(new AppError("Semester data must be an array", 400));
  }

  // Get student profile to verify USN
  const studentProfile = await StudentProfile.findOne({ userId });
  if (!studentProfile) {
    return next(new AppError("Student profile not found", 404));
  }

  // Check if USN matches
  if (studentProfile.usn.toUpperCase() !== usn.toUpperCase()) {
    return next(new AppError("USN does not match student profile", 400));
  }

  // Validate semester data structure
  semesterData.forEach((semester) => {
    if (!semester.semesterNumber || !semester.courses) {
      return next(
        new AppError(
          "Each semester must have semesterNumber and courses array",
          400
        )
      );
    }

    if (!Array.isArray(semester.courses)) {
      return next(new AppError("Courses must be an array", 400));
    }

    semester.courses.forEach((course) => {
      if (!course.courseCode || !course.courseName || course.credits === undefined) {
        return next(
          new AppError(
            "Each course must have courseCode, courseName, and credits",
            400
          )
        );
      }

      // Calculate total marks and validate
      if (
        course.internalMarks !== undefined &&
        course.externalMarks !== undefined
      ) {
        course.totalMarks = course.internalMarks + course.externalMarks;
      }

      // Assign grade based on total marks
      if (course.totalMarks !== undefined) {
        assignGradeAndPoints(course);
      }
    });

    // Calculate SGPA if not provided
    if (semester.courses.length > 0) {
      calculateSGPA(semester);
    }
  });

  let vtuResults = await VTUResults.findOne({ userId });

  if (!vtuResults) {
    vtuResults = await VTUResults.create({
      userId,
      usn: usn.toUpperCase(),
      semesters: semesterData,
      fetchedFrom: "manual",
    });
  } else {
    // Update existing results
    vtuResults.usn = usn.toUpperCase();
    vtuResults.semesters = semesterData;
    vtuResults.fetchedFrom = "manual";
    vtuResults.lastUpdated = new Date();
  }

  // Calculate CGPA for all semesters
  calculateCGPA(vtuResults);
  await vtuResults.save();

  res.status(201).json({
    status: "success",
    data: {
      vtuResults,
    },
  });
});

/**
 * Update a specific semester's results
 */
export const updateSemesterResults = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { semesterNumber, semesterData } = req.body;

  if (!semesterNumber || !semesterData) {
    return next(
      new AppError("semesterNumber and semesterData are required", 400)
    );
  }

  let vtuResults = await VTUResults.findOne({ userId });

  if (!vtuResults) {
    return next(new AppError("VTU results not found", 404));
  }

  // Validate and update semester
  semesterData.semesterNumber = semesterNumber;

  if (semesterData.courses && Array.isArray(semesterData.courses)) {
    semesterData.courses.forEach((course) => {
      if (
        course.internalMarks !== undefined &&
        course.externalMarks !== undefined
      ) {
        course.totalMarks = course.internalMarks + course.externalMarks;
      }

      if (course.totalMarks !== undefined) {
        assignGradeAndPoints(course);
      }
    });

    calculateSGPA(semesterData);
  }

  // Find and update semester
  const semesterIndex = vtuResults.semesters.findIndex(
    (s) => s.semesterNumber === semesterNumber
  );

  if (semesterIndex > -1) {
    vtuResults.semesters[semesterIndex] = semesterData;
  } else {
    vtuResults.semesters.push(semesterData);
  }

  vtuResults.lastUpdated = new Date();
  
  // Recalculate CGPA after updating semester
  calculateCGPA(vtuResults);
  await vtuResults.save();

  res.status(200).json({
    status: "success",
    data: {
      vtuResults,
    },
  });
});

/**
 * Get CGPA summary
 */
export const getVTUResultsSummary = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const vtuResults = await VTUResults.findOne({ userId });

  if (!vtuResults) {
    return next(new AppError("VTU results not found", 404));
  }

  const summary = {
    usn: vtuResults.usn,
    totalSemesters: vtuResults.semesters.length,
    cgpa: vtuResults.cgpa,
    semesters: vtuResults.semesters.map((sem) => ({
      semesterNumber: sem.semesterNumber,
      sgpa: sem.sgpa,
      courseCount: sem.courses.length,
      examMonth: sem.examMonth,
      examYear: sem.examYear,
    })),
    lastUpdated: vtuResults.lastUpdated,
  };

  res.status(200).json({
    status: "success",
    data: {
      summary,
    },
  });
});

/**
 * Get results for a specific semester
 */
export const getSemesterResults = catchAsync(async (req, res, next) => {
  const { userId, semesterNumber } = req.params;

  const vtuResults = await VTUResults.findOne({ userId });

  if (!vtuResults) {
    return next(new AppError("VTU results not found", 404));
  }

  const semester = vtuResults.semesters.find(
    (s) => s.semesterNumber === parseInt(semesterNumber)
  );

  if (!semester) {
    return next(
      new AppError(`Semester ${semesterNumber} not found`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      semester,
    },
  });
});

/**
 * Delete VTU results for a student
 */
export const deleteVTUResults = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const vtuResults = await VTUResults.findOneAndDelete({ userId });

  if (!vtuResults) {
    return next(new AppError("VTU results not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "VTU results deleted successfully",
  });
});

/**
 * Helper function to assign grade and grade point based on total marks
 */
function assignGradeAndPoints(course) {
  const marks = course.totalMarks;

  if (marks >= 90) {
    course.grade = "O";
    course.gradePoint = 10;
  } else if (marks >= 80) {
    course.grade = "A+";
    course.gradePoint = 9;
  } else if (marks >= 70) {
    course.grade = "A";
    course.gradePoint = 8;
  } else if (marks >= 60) {
    course.grade = "B+";
    course.gradePoint = 7;
  } else if (marks >= 50) {
    course.grade = "B";
    course.gradePoint = 6;
  } else if (marks >= 40) {
    course.grade = "C";
    course.gradePoint = 5;
  } else if (marks >= 35) {
    course.grade = "P";
    course.gradePoint = 4;
  } else {
    course.grade = "F";
    course.gradePoint = 0;
  }
}

/**
 * Fetch External Marks from VTU Official Portal by USN
 * This endpoint fetches live external marks data from VTU's results portal
 */
export const fetchExternalMarksFromVTU = catchAsync(async (req, res, next) => {
  const { usn } = req.body;

  // Validate USN
  if (!usn || typeof usn !== "string" || usn.trim().length < 8) {
    return next(new AppError("Please provide a valid USN (minimum 8 characters)", 400));
  }

  try {
    // Import the VTU external marks utility
    const { fetchVTUExternalMarks } = await import("../../utils/vtuExternalMarks.js");

    console.log(`Fetching external marks from VTU for USN: ${usn}`);

    // Fetch from VTU official portal
    const semesterResults = await fetchVTUExternalMarks(usn.trim());

    // Transform the data into external marks format
    const externalMarks = {
      usn: usn.trim().toUpperCase(),
      semesters: semesterResults,
      fetchedAt: new Date(),
      source: "VTU Official Results Portal",
    };

    res.status(200).json({
      status: "success",
      message: `Successfully fetched external marks for ${semesterResults.length} semester(s)`,
      data: {
        external: externalMarks,
      },
    });
  } catch (error) {
    console.error("Error fetching VTU external marks:", error.message);
    return next(
      new AppError(
        error.message ||
          "Failed to fetch external marks. Please ensure the USN is correct and results have been published.",
        400
      )
    );
  }
});

/**
 * Helper function to calculate SGPA for a semester
 */
function calculateSGPA(semester) {
  if (!semester.courses || semester.courses.length === 0) return;

  let totalGradePoints = 0;
  let totalCredits = 0;

  semester.courses.forEach((course) => {
    if (course.gradePoint !== undefined && course.credits) {
      totalGradePoints += course.gradePoint * course.credits;
      totalCredits += course.credits;
    }
  });

  semester.sgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
}

/**
 * Helper function to calculate CGPA from all semesters
 */
function calculateCGPA(vtuResults) {
  if (!vtuResults.semesters || vtuResults.semesters.length === 0) {
    vtuResults.cgpa = 0;
    return;
  }

  let totalGradePoints = 0;
  let totalCredits = 0;

  vtuResults.semesters.forEach((semester) => {
    if (semester.courses && semester.courses.length > 0) {
      semester.courses.forEach((course) => {
        if (course.gradePoint !== undefined && course.credits) {
          totalGradePoints += course.gradePoint * course.credits;
          totalCredits += course.credits;
        }
      });
    }
  });

  vtuResults.cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
}
