const mongoose = require('mongoose');
// Response Schema
const ResponseSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  assignment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  response_text: { type: String, required: true },
  marks_obtained: { type: Number, default: 0 },
  time_taken: { type: Number, required: true },
  submitted_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Response', ResponseSchema);