const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Course Schema
const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String },
  class: { type: String, required: true },
  batch: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
  created_at: { 
    type: String, 
    default: () => moment().tz("Asia/Kolkata").format("DD/MM/YYYY :: HH:mm:ss") 
  },
  updated_at: { 
    type: String, 
    default: () => moment().tz("Asia/Kolkata").format("DD/MM/YYYY :: HH:mm:ss") 
  },
  });
  
  module.exports = mongoose.model('Course', CourseSchema);