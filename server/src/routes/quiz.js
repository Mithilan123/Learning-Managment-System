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

router.post("/:courseId/submit", protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId });
    if (!quiz?.questions?.length) return res.status(404).json({ message: "Quiz not available" });

    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') return res.status(400).json({ message: "Answers are required" });

    let score = 0;
    const totalPoints = quiz.questions.reduce((acc, q) => acc + (q.points || 1), 0);
    quiz.questions.forEach((q, index) => {
      const answerKey = String(q._id || q.id || `q-${index}`);
      if (answers[answerKey] === q.correctAnswer) score += (q.points || 1);
    });
    const percentage = totalPoints ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= (quiz.passingScore || 70);

    quiz.submissions.push({ student: req.user._id, score, totalPoints, percentage, passed });
    await quiz.save();
    res.json({ score, totalPoints, percentage, passed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:courseId", protect, async (req, res) => {
  try {
    if (req.user.role !== "instructor") return res.status(403).json({ message: "Forbidden" });
    const { title, passingScore, questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "At least one quiz question is required" });
    }

    let quiz = await Quiz.findOne({ course: req.params.courseId });
    if (quiz) {
      quiz.title = title?.trim() || quiz.title || "Course Quiz";
      quiz.passingScore = passingScore ?? quiz.passingScore;
      quiz.questions = questions;
      await quiz.save();
    } else {
      const safeTitle = title?.trim() || "Course Quiz";
      quiz = await Quiz.create({
        course: req.params.courseId,
        title: safeTitle,
        passingScore: passingScore ?? 70,
        questions,
      });
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
