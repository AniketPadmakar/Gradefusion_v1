const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Response Schema
const ResponseSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  assignment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  isSubmitted: { type: Boolean, default: false },
  response_text: { type: String, required: true },
  marks_obtained: { type: Number, default: 0 },
  status: {type: String,enum: ['submitted', 'reopened', 'resubmitted', 'graded'],default: 'submitted'},
  time_taken: { type: Number, required: true },
  test_results: {
    passedTests: { type: Number, required: true },
    totalTests: { type: Number, required: true },
    allResults: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' },
      status: String,
      output: String,
      expectedOutput: String,
      message: String,
      isSuccess: Boolean,
      input: String
    }]
  },
  submitted_at: { type: String, 
    default: () => moment().tz("Asia/Kolkata").format("DD/MM/YYYY :: HH:mm:ss")},
  created_at: { 
    type: String, 
    default: () => moment().tz("Asia/Kolkata").format("DD/MM/YYYY :: HH:mm:ss") 
  },
  updated_at: { 
    type: String, 
    default: () => moment().tz("Asia/Kolkata").format("DD/MM/YYYY :: HH:mm:ss") 
  },
});
  
module.exports = mongoose.model('Response', ResponseSchema);