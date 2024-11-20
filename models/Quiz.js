import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  description: String,
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    default: 'medium' 
  },
  timeLimit: { 
    type: Number, 
    default: 600 
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  active: { 
    type: Boolean, 
    default: true 
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

export const Quiz = mongoose.model('Quiz', quizSchema);