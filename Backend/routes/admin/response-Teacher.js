const express = require('express');
const router = express.Router();
const Response = require('../../models/Response');
const Student = require('../../models/student');
const Course = require('../../models/course');
const Assignment = require('../../models/Assignment');
const authMiddleware = require('../../middleware/fetchadmin');

// Fetch Responses for a Specific Batch or Student in that Batch
router.get('/fetch-batch-responses', authMiddleware, async (req, res) => {
    try {
        const { batch, student_id } = req.query;

        if (!batch) {
            return res.status(400).json({ message: "Batch is required" });
        }

        // Get all student IDs in the given batch
        const students = await Student.find({ batch }).select("_id");
        const studentIds = students.map((s) => s._id.toString());

        if (students.length === 0) {
            return res.status(404).json({ message: "No students found in this batch" });
        }

        if (student_id) {
            // Ensure the student is in the batch
            if (!studentIds.includes(student_id)) {
                return res.status(404).json({ message: "Student not found in this batch" });
            }

            // Fetch responses for the specific student
            const responses = await Response.find({ student_id })
                .populate("assignment_id question_id");

            return res.json(responses);
        }

        // Fetch responses for all students in the batch
        const responses = await Response.find({ student_id: { $in: studentIds } })
            .populate("assignment_id question_id");

        return res.json(responses);
    } catch (error) {
        console.error("Error fetching responses:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Assignment Performance Report
router.get('/performance-report', authMiddleware, async (req, res) => {
    try {
        const { assignment_id, student_id } = req.query;

        // Verify that the assignment exists and belongs to the authenticated teacher
        const assignment = await Assignment.findOne({ 
            _id: assignment_id, 
            teacher_id: req.user._id 
        });

        if (!assignment) {
            return res.status(404).json({ 
                message: 'Assignment not found or unauthorized' 
            });
        }

        // Build query to fetch responses
        const query = { assignment_id };
        if (student_id) query.student_id = student_id;

        const performanceReport = await Response.aggregate([
            { $match: query },
            { $group: {
                _id: null,
                total_responses: { $sum: 1 },
                avg_marks: { $avg: '$marks_obtained' },
                max_marks: { $max: '$marks_obtained' },
                min_marks: { $min: '$marks_obtained' }
            }}
        ]);

        res.status(200).json({
            assignment_name: assignment.assignment_name,
            performance: performanceReport.length > 0 ? performanceReport[0] : {
                total_responses: 0,
                avg_marks: 0,
                max_marks: 0,
                min_marks: 0
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error generating performance report', 
            error: error.message 
        });
    }
});


module.exports = router;
