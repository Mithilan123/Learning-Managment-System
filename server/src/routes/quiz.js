import express from "express";
import Quiz from "../models/Quiz.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("/:courseId", protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:courseId", protect, async (req, res) => {
  try {
    if (req.user.role !== "instructor") return res.status(403).json({ message: "Forbidden" });
    const quiz = await Quiz.findOneAndUpdate(
      { course: req.params.courseId },
      { ...req.body, course: req.params.courseId },
      { upsert: true, new: true }
    );
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:courseId/submit", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") return res.status(403).json({ message: "Forbidden" });
    const quiz = await Quiz.findOne({ course: req.params.courseId });
    if (!quiz?.questions?.length) return res.status(404).json({ message: "Quiz not available" });

    const { answers } = req.body;
    let score = 0;
    const totalPoints = quiz.questions.reduce((acc, q) => acc + q.points, 0);
    quiz.questions.forEach((q) => {
      if (answers[String(q._id)] === q.correctAnswer) score += q.points;
    });
    const percentage = Math.round((score / totalPoints) * 100);
    const passed = percentage >= quiz.passingScore;

    quiz.submissions.push({ student: req.user._id, score, totalPoints, percentage, passed });
    await quiz.save();
    res.json({ score, totalPoints, percentage, passed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
