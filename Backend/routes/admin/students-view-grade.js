// @route    GET /api/responses/student/:studentId
// @desc     Get all responses and grades for a student
// @access   Private (Only students can view their own responses and grades)
const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment"); // Assuming Assignment model exists
const Student = require("../models/Student"); // Assuming Student model exists
const authenticateStudent = require("../middleware/authenticateStudent"); // Middleware for authentication

router.get(
    "/responses/student/:studentId",
    authenticateUser, // Middleware to check if the user is logged in
    authorizeRole('student'), // Middleware to ensure only students can view their own responses
    async (req, res) => {
      try {
        const { studentId } = req.params;
        const userId = req.user.id; // Extract student ID from auth token
  
        // Ensure the logged-in user is the same as the student requesting the data
        if (userId !== studentId) {
          return res.status(403).json({ message: "You are not authorized to view this data" });
        }
  
        // Find all responses submitted by the student
        const responses = await Response.find({ student_id: studentId })
          .populate("assignment_id") // Populate assignment details
          .populate("question_id"); // Populate question details
  
        if (!responses || responses.length === 0) {
          return res.status(404).json({ message: "No responses found for this student" });
        }
  
        // Return the student's responses and grades
        res.status(200).json({
          message: "Responses and grades retrieved successfully",
          responses: responses.map((response) => {
            // Return response data with grading information (if graded)
            return {
              ...response._doc,
              grade: response.marks_obtained,
              graded: response.marks_obtained !== 0, // Mark if graded or not
            };
          }),
        });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
    }
);
