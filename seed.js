import mongoose from 'mongoose';
import { Quiz } from './models/Quiz.js';
import { Question } from './models/Question.js';
import { User } from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { MONGODB_URI } = process.env;

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Quiz.deleteMany({}),
      Question.deleteMany({}),
      User.deleteMany({})
    ]);

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Create questions for different categories
    const categories = {
      general: await Question.create([
        {
          question: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 2,
          explanation: 'Paris is the capital city of France.',
          points: 10,
          difficulty: 'easy'
        },
        {
          question: 'Which planet is known as the Red Planet?',
          options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
          correctAnswer: 1,
          explanation: 'Mars is called the Red Planet due to its reddish appearance.',
          points: 10,
          difficulty: 'easy'
        }
      ]),
      sports: await Question.create([
        {
          question: 'Which country won the FIFA World Cup 2022?',
          options: ['Brazil', 'France', 'Argentina', 'Germany'],
          correctAnswer: 2,
          explanation: 'Argentina won the 2022 FIFA World Cup.',
          points: 15,
          difficulty: 'medium'
        },
        {
          question: 'In which sport would you perform a slam dunk?',
          options: ['Football', 'Basketball', 'Tennis', 'Golf'],
          correctAnswer: 1,
          explanation: 'A slam dunk is a basketball scoring technique.',
          points: 10,
          difficulty: 'easy'
        }
      ]),
      health: await Question.create([
        {
          question: 'What vitamin does sunlight help your body produce?',
          options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E'],
          correctAnswer: 2,
          explanation: 'Sunlight helps your body produce Vitamin D.',
          points: 15,
          difficulty: 'medium'
        },
        {
          question: 'How many hours of sleep are recommended for adults?',
          options: ['4-5 hours', '6-7 hours', '7-9 hours', '10-12 hours'],
          correctAnswer: 2,
          explanation: 'Adults need 7-9 hours of sleep per night.',
          points: 10,
          difficulty: 'easy'
        }
      ]),
      technology: await Question.create([
        {
          question: 'Who is the co-founder of Microsoft?',
          options: ['Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Jeff Bezos'],
          correctAnswer: 1,
          explanation: 'Bill Gates co-founded Microsoft with Paul Allen.',
          points: 20,
          difficulty: 'hard'
        },
        {
          question: 'What does CPU stand for?',
          options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Computer Processing Unit'],
          correctAnswer: 0,
          explanation: 'CPU stands for Central Processing Unit.',
          points: 10,
          difficulty: 'easy'
        }
      ])
    };

    // Create quizzes
    const quizzes = await Quiz.create([
      {
        title: 'General Knowledge Quiz',
        category: 'General Knowledge',
        description: 'Test your general knowledge!',
        difficulty: 'easy',
        timeLimit: 300,
        questions: categories.general.map(q => q._id),
        active: true,
        isPublic: true
      },
      {
        title: 'Sports Trivia',
        category: 'Sports',
        description: 'Challenge yourself with sports questions!',
        difficulty: 'medium',
        timeLimit: 300,
        questions: categories.sports.map(q => q._id),
        active: true,
        isPublic: false
      },
      {
        title: 'Health & Wellness',
        category: 'Health',
        description: 'Test your health knowledge!',
        difficulty: 'medium',
        timeLimit: 300,
        questions: categories.health.map(q => q._id),
        active: true,
        isPublic: false
      },
      {
        title: 'Technology Quiz',
        category: 'Technology',
        description: 'Prove your tech expertise!',
        difficulty: 'hard',
        timeLimit: 300,
        questions: categories.technology.map(q => q._id),
        active: true,
        isPublic: false
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();