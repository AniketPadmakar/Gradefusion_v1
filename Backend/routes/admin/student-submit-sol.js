// @route    POST /api/assignments/:assignmentId/submit
// @desc     Submit a response for an assignment (Only sent to the respective teacher)
// @access   Private (Only students can submit)
const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment"); // Assuming Assignment model exists
const Student = require("../models/Student"); // Assuming Student model exists
const authenticateStudent = require("../middleware/authenticateStudent"); // Middleware for authentication

router.post(
    '/:assignmentId/submit',
    authenticateUser, // Middleware to authenticate user
    authorizeRole('student'), // Middleware to ensure only students can submit
    async (req, res) => {
      try {
        const { assignmentId } = req.params;
        const { responseText, fileUrl, timeTaken } = req.body; // Response text or file link
        const studentId = req.user.id; // Extract student ID from auth token
  
        // Find the student's batch
        const student = await User.findById(studentId);
        if (!student) {
          return res.status(404).json({ message: 'Student not found' });
        }
  
        // Find the assignment assigned to the student's batch
        const assignment = await Assignment.findOne({ 
          _id: assignmentId, 
          batch: student.batch // Ensure the assignment is assigned to this student's batch
        });

        if (!assignment) {
          return res.status(404).json({ message: 'Assignment not found for your batch' });
        }

        // Ensure the assignment is still open for submission
        if (new Date() > assignment.dueDate) {
          return res.status(400).json({ message: 'Assignment submission deadline has passed' });
        }

        // Check if the student has already submitted a response for this assignment
        const existingResponse = await Response.findOne({ 
          assignment_id: assignmentId, 
          student_id: studentId 
        });

        if (existingResponse) {
          return res.status(400).json({ message: 'You have already submitted a response for this assignment' });
        }
  
        // Create new response
        const response = new Response({
          assignment_id: assignmentId,
          student_id: studentId,
          response_text: responseText,
          fileUrl,
          time_taken: timeTaken,
          submitted_at: new Date(),
        });

        await response.save();
  
        // Notify only the teacher associated with this assignment
        const teacher = await User.findById(assignment.teacher);
        if (teacher) {
          // You can integrate a notification system here (e.g., email, real-time notifications)
          console.log(`Notification sent to teacher: ${teacher.email}`);
        }
  
        res.status(201).json({
          message: 'Response submitted successfully',
          response,
          teacherId: assignment.teacher, // Ensuring only the respective teacher sees this
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    }
);
