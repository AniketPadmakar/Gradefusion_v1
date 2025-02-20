const express = require("express");
const router = express.Router();
const Response = require("../../models/Response");
const Assignment = require("../../models/Assignment"); 
const Student = require("../../models/student"); 
const authenticateStudent = require("../../middleware/fetchuser"); // Ensure correct middleware

// @route    GET /api/responses/student/:studentId
// @desc     Get all responses and grades for a student
// @access   Private (Only students can view their own responses)
router.get(
  "/responses/student/:studentId",
  authenticateStudent, // Middleware to verify login
  async (req, res) => {
    try {
      const { studentId } = req.params;
      const userId = req.user.id; // Extract student ID from auth token

      // Check if the logged-in student is requesting their own data
      if (String(userId) !== String(studentId)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      // Fetch all responses submitted by the student
      const responses = await Response.find({ student_id: studentId })
        .populate("assignment_id", "assignment_name") // Populate assignment details
        .populate("question_id", "question_text"); // Populate question details

      if (!responses.length) {
        return res.status(404).json({ message: "No responses found for this student" });
      }

      // Format and send response
      res.status(200).json({
        message: "Responses and grades retrieved successfully",
        responses: responses.map((response) => ({
          _id: response._id,
          assignment: response.assignment_id.assignment_name,
          question: response.question_id.question_text,
          answer: response.answer_text,
          grade: response.marks_obtained,
          graded: response.marks_obtained > 0, // Indicates if it has been graded
          submitted_at: response.createdAt,
        })),
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
