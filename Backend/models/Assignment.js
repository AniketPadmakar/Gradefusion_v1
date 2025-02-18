const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Assignment Schema
const AssignmentSchema = new mongoose.Schema({
  assignment_name: { type: String, required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }],
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  student_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }], // Array of student IDs
  due_at: { type: String, required: true },
  marks: { type: Number, required: true },
  created_at: { 
    type: String, 
    default: () => moment().tz("Asia/Kolkata").format("DD/MM/YYYY :: HH:mm:ss") 
  },
  updated_at: { 
    type: String, 
    default: () => moment().tz("Asia/Kolkata").format("DD/MM/YYYY :: HH:mm:ss") 
  },
  });
  
  module.exports = mongoose.model('Assignment', AssignmentSchema);