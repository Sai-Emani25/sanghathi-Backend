import mongoose from "mongoose";

const { Schema, model } = mongoose;

const vtuResultsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    usn: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    semesters: [
      {
        semesterNumber: {
          type: Number,
          required: true,
          min: 1,
          max: 8,
        },
        courses: [
          {
            courseCode: {
              type: String,
              required: true,
            },
            courseName: {
              type: String,
              required: true,
            },
            credits: {
              type: Number,
              required: true,
            },
            internalMarks: {
              type: Number,
              min: 0,
              max: 50,
            },
            externalMarks: {
              type: Number,
              min: 0,
              max: 50,
            },
            totalMarks: {
              type: Number,
              min: 0,
              max: 100,
            },
            grade: {
              type: String,
              enum: ["O", "A+", "A", "B+", "B", "C", "P", "F"],
            },
            gradePoint: {
              type: Number,
              min: 0,
              max: 10,
            },
          },
        ],
        sgpa: {
          type: Number,
          min: 0,
          max: 10,
        },
        examMonth: {
          type: String,
          enum: ["January", "June", "December"],
        },
        examYear: {
          type: Number,
        },
        fetchedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    fetchedFrom: {
      type: String,
      enum: ["manual", "automated", "eddts"],
      default: "manual",
    },
  },
  { timestamps: true }
);

// Update CGPA before saving
vtuResultsSchema.pre("save", function (next) {
  if (this.semesters && this.semesters.length > 0) {
    const totalGradePoints = this.semesters.reduce(
      (acc, sem) => acc + (sem.sgpa || 0),
      0
    );
    this.cgpa = totalGradePoints / this.semesters.length;
  }
  next();
});

const VTUResults = model("VTUResults", vtuResultsSchema);

export default VTUResults;
