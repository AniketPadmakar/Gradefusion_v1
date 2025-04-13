const mongoose = require('mongoose');
const dateUtils = require('../utils/dateUtils');

// Assignment Schema
const AssignmentSchema = new mongoose.Schema({
  assignment_name: { type: String, required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }],
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  student_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }],
  start_at: { 
    type: String, 
    required: true,
    validate: {
      validator: dateUtils.isValidDate,
      message: 'Invalid date format'
    }
  },
  due_at: { 
    type: String, 
    required: true,
    validate: {
      validator: dateUtils.isValidDate,
      message: 'Invalid date format'
    }
  },
  marks: { type: Number, required: true },
  created_at: { 
    type: String, 
    default: dateUtils.getCurrentDate
  },
  updated_at: { 
    type: String, 
    default: dateUtils.getCurrentDate
  },
  });
  
  module.exports = mongoose.model('Assignment', AssignmentSchema);