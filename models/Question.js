import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true 
  },
  options: [{ 
    type: String, 
    required: true 
  }],
  correctAnswer: { 
    type: Number, 
    required: true 
  }, // index of correct option
  explanation: String,
  points: { 
    type: Number, 
    default: 10 
  }
}, { 
  timestamps: true 
});

export const Question = mongoose.model('Question', questionSchema);