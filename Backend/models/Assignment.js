const mongoose = require('mongoose');
// Assignment Schema
const AssignmentSchema = new mongoose.Schema({
  assignment_name: { type: String, required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }],
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  student_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }], // Array of student IDs
  due_at: { type: Date, required: true },
  marks: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Assignment', AssignmentSchema);