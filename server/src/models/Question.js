import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    text: { type: String, required: true },
    askedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: [answerSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
