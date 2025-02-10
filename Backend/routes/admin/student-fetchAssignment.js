const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment"); // Assuming Assignment model exists
const Student = require("../models/Student"); // Assuming Student model exists
const authenticateStudent = require("../middleware/authenticateStudent"); // Middleware for authentication

// Route to fetch assignments for a student based on batch number
router.get("/assignments", authenticateStudent, async (req, res) => {
    try {
        // Get student ID from the authenticated user
        const studentId = req.user.id;

        // Find the student to get the batch number
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Fetch assignments based on batch number
        const assignments = await Assignment.find({ batchNo: student.batchNo });

        res.status(200).json({ assignments });
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
