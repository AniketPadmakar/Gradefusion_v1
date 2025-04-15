const express = require("express");
const router = express.Router();
const Assignment = require("../../models/Assignment");
const Student = require("../../models/student");
const Response = require("../../models/Response"); // Assuming Response model exists
const authenticateStudent = require("../../middleware/fetchuser");
const moment = require('moment-timezone');

router.post("/:assignmentId/submit", authenticateStudent, async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { responseText, timeTaken, testResults } = req.body;
        const studentId = req.user.id.toString();;

        // Find the assignment
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Fetch all students assigned to this assignment
        const studentsInAssignment = await Student.find({ _id: { $in: assignment.student_ids } });

        if (!studentsInAssignment.length) {
            return res.status(400).json({ message: "No students assigned to this assignment" });
        }

        // Get the batch of the requesting student
        const requestingStudent = studentsInAssignment.find(student => student._id.toString() === studentId);
        if (!requestingStudent) {
            return res.status(403).json({ message: "You are not part of this assignment" });
        }

        const batchNo = requestingStudent.batch;

        // Filter students who belong to the same batch
        const eligibleStudents = studentsInAssignment.filter(student => student.batch === batchNo);

        // Check if the requesting student is eligible
        if (!eligibleStudents.some(student => student._id.toString() === studentId)) {
            return res.status(403).json({ message: "You are not eligible to submit this assignment" });
        }

        // Ensure the assignment is still open for submission
        if (new Date() > new Date(assignment.due_at)) {
            return res.status(400).json({ message: "Assignment submission deadline has passed" });
        }

        // Check if the student has already submitted a response
        const existingResponse = await Response.findOne({ assignment_id: assignmentId, student_id: studentId });
        if (existingResponse) {
            return res.status(400).json({ message: "You have already submitted a response for this assignment" });
        }

        // Extract a random question from the assignment
        if (assignment.questions.length === 0) {
            return res.status(400).json({ message: "No questions found in the assignment" });
        }

        const randomQuestion = assignment.questions[Math.floor(Math.random() * assignment.questions.length)];

        // Create and store response
        const response = new Response({
            assignment_id: assignmentId,
            student_id: studentId,
            question_id: randomQuestion, // Store the randomly assigned question
            response_text: responseText,
            time_taken: timeTaken,
            test_results: {
                passedTests: testResults.passedTests,
                totalTests: testResults.totalTests,
                allResults: testResults.allResults
            }
        });

        await response.save();

        res.status(201).json({
            message: "Response submitted successfully",
            response,
        });

    } catch (error) {
        console.error("Error submitting assignment:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Route to mark assignment as submitted
router.post("/mark-submitted/:assignmentId", authenticateStudent, async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const studentId = req.user.id;

        // Find if there's already a submission
        const existingSubmission = await Response.findOne({ 
            assignment_id: assignmentId, 
            student_id: studentId 
        });

        if (!existingSubmission) {
            return res.status(404).json({ message: "No submission found" });
        }

        existingSubmission.isSubmitted = true;
        await existingSubmission.save();

        res.status(200).json({ message: "Assignment marked as submitted" });
    } catch (error) {
        console.error("Error marking assignment as submitted:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;