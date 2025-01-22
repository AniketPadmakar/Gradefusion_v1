const mongoose = require('mongoose');
// Question Schema
const QuestionSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    questionText: { type: String, required: true },
    options: [{ text: String, isCorrect: Boolean }], // For MCQs
    marks: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
  const Question = mongoose.model('Question', QuestionSchema);