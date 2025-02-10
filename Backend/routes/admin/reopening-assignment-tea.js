// @route    PATCH /api/assignments/:assignmentId/reopen/:studentId
// @desc     Reopen an assignment for a specific student (Only the teacher can do this)
// @access   Private (Only the respective teacher of the assignment)
const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment"); // Assuming Assignment model exists
const Student = require("../models/Student"); // Assuming Student model exists
const authenticateStudent = require("../middleware/authenticateStudent"); // Middleware for authentication

router.patch(
    "/assignments/:assignmentId/reopen/:studentId",
    authenticateUser, // Middleware to authenticate user
    authorizeRole('teacher'), // Middleware to ensure only teachers can reopen assignments
    async (req, res) => {
      try {
        const { assignmentId, studentId } = req.params;
        const teacherId = req.user.id; // Extract teacher ID from logged-in user
  
        // Find the assignment
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
          return res.status(404).json({ message: "Assignment not found" });
        }
  
        // Ensure only the teacher who created the assignment can reopen it
        if (assignment.teacher.toString() !== teacherId) {
          return res.status(403).json({ message: "You are not authorized to reopen this assignment" });
        }
  
        // Find the response by the student
        const response = await Response.findOne({ assignment_id: assignmentId, student_id: studentId });
        if (!response) {
          return res.status(404).json({ message: "No response found for this student in the assignment" });
        }
  
        // Check if the assignment is already reopened
        if (response.reopened) {
          return res.status(400).json({ message: "This assignment has already been reopened for the student" });
        }
  
        // Reopen the assignment for the student
        response.reopened = true;
        response.updated_at = new Date(); // Update the timestamp of the response
  
        await response.save();
  
        res.status(200).json({
          message: "Assignment reopened successfully for the student",
          response,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
    }
  );
  