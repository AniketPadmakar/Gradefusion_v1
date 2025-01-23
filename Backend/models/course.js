const mongoose = require('mongoose');
// Course Schema
const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String },
  class: { type: String, required: true },
  batch: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
  });
  
  const Course = mongoose.model('Course', CourseSchema);