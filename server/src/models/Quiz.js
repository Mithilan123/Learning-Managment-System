import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  points: { type: Number, default: 1 },
});

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    score: Number,
    totalPoints: Number,
    percentage: Number,
    passed: Boolean,
  },
  { timestamps: true }
);

const quizSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, unique: true },
    title: { type: String, required: true, trim: true, default: "Course Quiz" },
    passingScore: { type: Number, default: 70 },
    questions: [quizQuestionSchema],
    submissions: [submissionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
