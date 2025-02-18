const mongoose = require("mongoose");
const moment = require('moment-timezone');

// Question Schema
const QuestionSchema = new mongoose.Schema({
  question_text: { type: String, required: true },
  example_input_output: [
    {
      input: { type: String, required: true},
      output: { type: String, required: true },
    },
  ],
  marks: { type: Number, required: true },
  test_cases: [
    {
      input: { type: String },
      expected_output: { type: String },
    },
  ],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true 
  },
  subject: { type: String },
  created_at: { 
    type: String, 
    default: () => moment().tz("Asia/Kolkata").format("DD/MM/YYYY :: HH:mm:ss") 
  },
  updated_at: { 
    type: String, 
    default: () => moment().tz("Asia/Kolkata").format("DD/MM/YYYY :: HH:mm:ss") 
  },
});

module.exports= mongoose.model("Question", QuestionSchema);