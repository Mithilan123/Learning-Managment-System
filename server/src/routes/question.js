import express from "express";
import Question from "../models/Question.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("/:courseId", protect, async (req, res) => {
  try {
    const questions = await Question.find({ course: req.params.courseId })
      .populate("askedBy", "name email")
      .populate("answers.answeredBy", "name email");
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:courseId", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") return res.status(403).json({ message: "Forbidden" });
    const question = await Question.create({ course: req.params.courseId, text: req.body.text, askedBy: req.user._id });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:questionId/answer", protect, async (req, res) => {
  try {
    if (req.user.role !== "instructor") return res.status(403).json({ message: "Forbidden" });
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });
    question.answers.push({ text: req.body.text, answeredBy: req.user._id });
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
