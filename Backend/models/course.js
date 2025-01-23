const mongoose = require('mongoose');
// Course Schema
const CourseSchema = new mongoose.Schema({
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    course_name: { type: String, required: true },
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }]
  });
  
  const Course = mongoose.model('Course', CourseSchema);