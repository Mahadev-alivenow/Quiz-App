import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

export const Score = mongoose.model('Score', scoreSchema);