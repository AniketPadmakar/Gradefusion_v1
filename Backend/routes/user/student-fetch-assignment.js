const express = require("express");
const router = express.Router();
const Assignment = require("../../models/Assignment"); // Assuming Assignment model exists
const Student = require("../../models/student"); // Assuming Student model exists
const authenticateStudent = require("../../middleware/fetchuser"); // Middleware for authentication
const moment = require('moment-timezone');


// Route to fetch assignments for a student with only one random question per assignment
router.get("/assignments-student", authenticateStudent, async (req, res) => {
    try {
        // Get student ID from the authenticated user
        const studentId = req.user.id;

        // Find the student to get batch number
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Fetch assignments where student is assigned
        const assignments = await Assignment.find({
            batchNo: student.batchNo,
            student_ids: studentId // Ensures the assignment is specifically for this student
        });

        if (assignments.length === 0) {
            return res.status(404).json({ message: "No assignments found for this student" });
        }

        // Modify assignments to include only one random question per assignment
        const modifiedAssignments = assignments.map(assignment => {
            if (assignment.questions && assignment.questions.length > 0) {
                const randomQuestion = assignment.questions[Math.floor(Math.random() * assignment.questions.length)];
                return {
                    _id: assignment._id,
                    assignment_name: assignment.assignment_name,
                    questions: [randomQuestion], // Keep only one random question
                    teacher_id: assignment.teacher_id,
                    due_at: assignment.due_at,
                    marks: assignment.marks,
                    created_at: assignment.created_at,
                    updated_at: assignment.updated_at
                };
            }
            return null; // Ignore assignments with no questions
        }).filter(Boolean); // Remove null values

        res.status(200).json({ assignments: modifiedAssignments });
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
