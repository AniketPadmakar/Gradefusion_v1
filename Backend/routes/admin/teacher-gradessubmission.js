// @route    PATCH /api/responses/:responseId/grade
// @desc     Grade a student's response for an assignment
// @access   Private (Only the respective teacher of the assignment)
const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment"); // Assuming Assignment model exists
const Student = require("../models/Student"); // Assuming Student model exists
const authenticateStudent = require("../middleware/authenticateStudent"); // Middleware for authentication

router.patch(
    "/responses/:responseId/grade",
    authenticateUser, // Middleware to check if the user is logged in
    async (req, res) => {
      try {
        const { responseId } = req.params;
        const { grade } = req.body; // Only grade, no feedback
        const teacherId = req.user.id; // Extract teacher ID from logged-in user
  
        // Find the response and populate assignment details
        const response = await Response.findById(responseId).populate("assignment_id");
  
        if (!response) {
          return res.status(404).json({ message: "Response not found" });
        }
  
        // Ensure only the teacher who created the assignment can grade it
        if (response.assignment_id.teacher.toString() !== teacherId) {
          return res.status(403).json({ message: "You are not authorized to grade this response" });
        }
  
        // Update the response with the grade
        response.marks_obtained = grade;
        response.updated_at = new Date();
  
        await response.save();
  
        res.status(200).json({ message: "Response graded successfully", response });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
    }
);
