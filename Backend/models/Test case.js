const mongoose = require('mongoose');
const TestCaseResultSchema = new mongoose.Schema({
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    testCaseResults: [
      {
        input: { type: String },
        expectedOutput: { type: String },
        actualOutput: { type: String },
        passed: { type: Boolean },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
  const TestCaseResult = mongoose.model('TestCaseResult', TestCaseResultSchema);
  