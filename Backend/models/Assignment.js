const mongoose = require('mongoose');
// Assignment Schema
const AssignmentSchema = new mongoose.Schema({
  assignment_name: { type: String, required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }],
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  due_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  });
  
  const Assignment = mongoose.model('Assignment', AssignmentSchema);