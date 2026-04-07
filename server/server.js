import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import courseRoutes from "./src/routes/course.js";
import materialRoutes from "./src/routes/material.js";
import questionRoutes from "./src/routes/question.js";
import quizRoutes from "./src/routes/quiz.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quiz", quizRoutes);

connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
