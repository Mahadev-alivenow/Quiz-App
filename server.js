import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Quiz } from "./models/Quiz.js";
import { Question } from "./models/Question.js";
import { Score } from "./models/Score.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
const { MONGODB_URI, JWT_SECRET } = process.env;

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "https://quiz-category-app.netlify.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Health Check Routes
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Quiz API is running" });
});

app.get("/keepalive", (req, res) => {
  res.json({ status: "alive" });
});

// Auth Routes
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email or username" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({
          error: "Email not found. Please sign up or create an account.",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Quiz Routes
app.get("/api/quizzes", async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    const isAuthenticated = authHeader && authHeader.startsWith("Bearer ");

    const quizzes = await Quiz.find(
      isAuthenticated ? {} : { isPublic: true }
    ).populate("questions");

    res.json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

app.get("/api/quiz/:id", authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("questions");
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

app.post("/api/quiz/:id/submit", authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("questions");
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const { answers, timeTaken } = req.body;
    let score = 0;
    const maxScore = quiz.questions.reduce((total, q) => total + q.points, 0);

    answers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        score += quiz.questions[index].points;
      }
    });

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
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

app.get("/api/scores", authenticateToken, async (req, res) => {
  try {
    const scores = await Score.find({ user: req.user.id })
      .populate("quiz")
      .sort({ createdAt: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
