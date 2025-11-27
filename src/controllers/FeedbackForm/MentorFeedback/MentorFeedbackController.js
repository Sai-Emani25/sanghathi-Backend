import MentorFeedback from "../../../models/FeedbackForm/MentorFeedback/MentorFeedback.js";
import catchAsync from "../../../utils/catchAsync.js";
import AppError from "../../../utils/appError.js";

// Create Mentor Feedback
export const createMentorFeedback = catchAsync(async (req, res, next) => {
  const {
    userId,
    mentorFeedback,
    pstMembersAware,
    pltMembersAware,
    remarks,
    semester,
    rateMentor,
    averageScore
  } = req.body;

  if (!userId || !mentorFeedback || !pstMembersAware || !pltMembersAware || !semester || !rateMentor || !averageScore) {
    return next(new AppError("Missing required fields", 400));
  }

  const newFeedback = await MentorFeedback.create({
    userId,
    mentorFeedback,
    pstMembersAware,
    pltMembersAware,
    remarks,
    semester,
    rateMentor,
    averageScore
  });

  res.status(201).json({
    status: "success",
    data: {
      feedback: newFeedback,
    },
  });
});

// Get Mentor Feedback by User ID
export const getMentorFeedbackByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    return next(new AppError("userId param is required", 400));
  }

  const feedbackDoc = await MentorFeedback.findOne({ userId }).populate('mentorId', 'name email');
  if (!feedbackDoc) {
    return next(new AppError("Mentor feedback not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      feedback: feedbackDoc,
    },
  });
});

// Get all Mentor Feedback
export const getAllMentorFeedback = catchAsync(async (req, res, next) => {
  const results = await MentorFeedback.find()
    .populate('userId', 'name email')
    .populate('mentorId', 'name email');

  res.status(200).json({
    status: "success",
    results: results.length,
    data: results,
  });
});

// Delete Mentor Feedback by ID
export const deleteMentorFeedbackById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("Feedback ID is required", 400));
  }

  const deletedDoc = await MentorFeedback.findByIdAndDelete(id);
  if (!deletedDoc) {
    return next(new AppError("Mentor feedback not found for deletion", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Mentor feedback deleted successfully",
    data: null,
  });
});
