import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { User } from "./models/User.js";
import { Quiz } from "./models/Quiz.js";
import { Question } from "./models/Question.js";
import { Score } from "./models/Score.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://quiz-category-app.netlify.app"],
    credentials: true,
  })
);

app.use(express.json());

const { MONGODB_URI, PORT = 5003, JWT_SECRET } = process.env;

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Quiz API is running" });
});

// Get all quizzes
app.get("/api/quizzes", async (req, res) => {
  try {
    const isAuthenticated = req.header("Authorization");
    const quizzes = await Quiz.find(
      isAuthenticated ? {} : { isPublic: true }
    ).populate("questions");
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific quiz
app.get("/api/quiz/:id", authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("questions");
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz answers
app.post("/api/quiz/:id/submit", authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("questions");
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const { answers, timeTaken } = req.body;
    let score = 0;
    const maxScore = quiz.questions.reduce((total, q) => total + q.points, 0);

    // Calculate score
    answers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        score += quiz.questions[index].points;
      }
    });

    // Save score
    const newScore = await Score.create({
      user: req.user.id,
      quiz: quiz._id,
      score,
      maxScore,
      timeTaken,
    });

    res.json({
      score,
      maxScore,
      timeTaken,
      percentage: (score / maxScore) * 100,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user scores
app.get("/api/scores", authenticateToken, async (req, res) => {
  try {
    const scores = await Score.find({ user: req.user.id })
      .populate("quiz")
      .sort({ createdAt: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
