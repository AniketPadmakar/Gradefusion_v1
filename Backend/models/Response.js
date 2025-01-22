const mongoose = require('mongoose');
// Response Schema
const ResponseSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    answers: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
        responseText: { type: String },
        marksObtained: { type: Number, default: 0 },
      },
    ],
    submittedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
  const Response = mongoose.model('Response', ResponseSchema);