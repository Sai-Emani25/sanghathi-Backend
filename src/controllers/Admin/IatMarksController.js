// iatController.js
import Iat from "../../models/Admin/IatMarks.js";
import logger from "../../utils/logger.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";

/**
 * Get IAT data for a specific user by ID
 */
export const getIatData = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const iat = await Iat.findOne({ userId });

  if (!iat) {
    return next(new AppError("IAT data not found for this student", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      iat,
    },
  });
});

/**
 * Get IAT data by ID - for backward compatibility
 */
export const getIatById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const iat = await Iat.findOne({ userId: id });

  if (!iat) {
    return next(new AppError("IAT data not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      iat,
    },
  });
});

/**
 * Submit or update IAT data for a student
 */
export const submitIatData = catchAsync(async (req, res, next) => {
  const { semester, subjects } = req.body;
  const { userId } = req.params;

  // Validate input
  if (!semester || !subjects || !Array.isArray(subjects)) {
    return next(new AppError("Missing or invalid required fields (semester, subjects)", 400));
  }

  // Validate each subject has required fields
  for (const subject of subjects) {
    if (!subject.subjectCode || !subject.subjectName) {
      return next(new AppError("Each subject must have subjectCode and subjectName", 400));
    }
  }

  let iat = await Iat.findOne({ userId });

  if (!iat) {
    // Create a new IAT record if one doesn't exist
    const newIat = new Iat({
      userId,
      semesters: [{
        semester,
        subjects,
      }],
    });
    await newIat.save();
    logger.info(`New IAT record created for user ${userId}, semester ${semester}`);
    return res.status(201).json({ status: "success", data: { iat: newIat } });
  }

  // Find the index of the existing semester
  const semesterIndex = iat.semesters.findIndex((s) => s.semester === semester);

  if (semesterIndex === -1) {
    // Add a new semester if it doesn't exist
    iat.semesters.push({ semester, subjects });
    logger.info(`New semester ${semester} added for user ${userId}`);
  } else {
    // Update the subjects for the existing semester
    iat.semesters[semesterIndex].subjects = subjects;
    logger.info(`Semester ${semester} updated for user ${userId}`);
  }

  await iat.save();
  res.status(200).json({ status: "success", data: { iat } });
});

// Delete a specific semester for a user
export const deleteSemester = catchAsync(async (req, res, next) => {
  const { userId, semester } = req.params;

  const iat = await Iat.findOne({ userId });

  if (!iat) {
    return next(new AppError("No IAT records found for this user", 404));
  }

  // Filter out the semester to be deleted
  const initialLength = iat.semesters.length;
  iat.semesters = iat.semesters.filter((s) => s.semester !== parseInt(semester));

  if (iat.semesters.length === initialLength) {
    return next(new AppError(`Semester ${semester} not found`, 404));
  }

  await iat.save();
  logger.info(`Semester ${semester} deleted for user ${userId}`);

  res.status(200).json({ 
    status: "success", 
    message: `Semester ${semester} deleted successfully`,
    data: { iat } 
  });
});

/**
 * Delete multiple semesters for a user
 */
export const deleteMultipleSemesters = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { semesters } = req.body; // Expecting array of semester numbers: [1, 2, 3]

  if (!Array.isArray(semesters) || semesters.length === 0) {
    return next(new AppError("Please provide an array of semester numbers to delete", 400));
  }

  const iat = await Iat.findOne({ userId });

  if (!iat) {
    return next(new AppError("No IAT records found for this user", 404));
  }

  const initialLength = iat.semesters.length;
  
  // Filter out all semesters that are in the semesters array
  iat.semesters = iat.semesters.filter((s) => !semesters.includes(s.semester));

  const deletedCount = initialLength - iat.semesters.length;

  if (deletedCount === 0) {
    return next(new AppError("None of the specified semesters were found", 404));
  }

  await iat.save();
  logger.info(`${deletedCount} semester(s) deleted for user ${userId}`);

  res.status(200).json({ 
    status: "success", 
    message: `${deletedCount} semester(s) deleted successfully`,
    deletedSemesters: semesters.filter((sem) => !iat.semesters.some((s) => s.semester === sem)),
    data: { iat } 
  });
});

/**
 * Delete all IAT records for a user
 */
export const deleteAllIat = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  const result = await Iat.deleteMany({ userId: userId });

  if (result.deletedCount === 0) {
    return next(new AppError("No IAT records found for user ID", 404));
  }

  logger.info(`All IAT records deleted for user ${userId}`);
  res.status(200).json({ 
    status: "success",
    message: "All IAT records deleted successfully",
    deletedCount: result.deletedCount
  });
});