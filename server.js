import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { User } from "./models/User.js";
import { Quiz } from "./models/Quiz.js";
import { Question } from "./models/Question.js";
import { Score } from "./models/Score.js";

dotenv.config();

const app = express();

// Configure CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://quiz-category-app.netlify.app",
      // Add other frontend URLs as needed
    ],
    credentials: true,
  })
);

app.use(express.json());

const { MONGODB_URI, PORT = 5003 } = process.env;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Quiz API is running" });
});

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error();

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error();

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

// Auth routes
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists with this email or username",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
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
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate token
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
    res.status(500).json({ error: "Server error" });
  }
});

// // Quiz routes
// app.get("/api/quizzes", async (req, res) => {
//   try {
//     const quizzes = await Quiz.find().populate("questions");
//     res.json(quizzes);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Protected route example
// app.get("/api/profile", auth, async (req, res) => {
//   res.json(req.user);
// });

app.get("/api/quiz/:id", auth, async (req, res) => {
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

app.post("/api/quiz/:id/submit", auth, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quiz = await Quiz.findById(req.params.id).populate("questions");

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    let score = 0;
    const maxScore = quiz.questions.reduce((total, q) => total + q.points, 0);

    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += question.points;
      }
    });

    const scoreRecord = await Score.create({
      user: req.user._id,
      quiz: quiz._id,
      score,
      maxScore,
      timeTaken,
    });

    res.json({ score, maxScore, scoreRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/scores", auth, async (req, res) => {
  try {
    const scores = await Score.find({ user: req.user._id })
      .populate("quiz")
      .sort("-createdAt");
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/leaderboard/:quizId", async (req, res) => {
  try {
    const scores = await Score.find({ quiz: req.params.quizId })
      .populate("user", "username")
      .sort("-score")
      .limit(10);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// ... (rest of the server code remains the same)
