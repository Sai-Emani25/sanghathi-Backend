import mongoose from "mongoose";

const mentorFeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  },
  mentorFeedback: {
    type: [Number],
    required: true
  },
  pstMembersAware: {
    type: String,
    enum: ["yes", "no"],
    required: true
  },
  pltMembersAware: {
    type: String,
    enum: ["yes", "no"],
    required: true
  },
  remarks: {
    type: String,
    default: ""
  },
  semester: {
    type: Number,
    required: true
  },
  rateMentor: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  averageScore: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const MentorFeedback = mongoose.model(
  "MentorFeedback",
  mentorFeedbackSchema,
  "mentorfeedbacks" // <-- this links to the mentorfeedbacks collection
);
export default MentorFeedback;
