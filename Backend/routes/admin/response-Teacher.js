const express = require('express');
const router = express.Router();
const Response = require('../../models/Response');
const Student = require('../../models/student');
const Course = require('../../models/course');
const Assignment = require('../../models/Assignment');
const authMiddleware = require('../../middleware/fetchadmin');
const mongoose = require('mongoose');

// Fetch Responses for a Specific Batch or Student in that Batch
router.get('/fetch-batch-responses', authMiddleware, async (req, res) => {
    try {
        const { batch, student_id } = req.query;

        if (!batch) {
            return res.status(400).json({ message: "Batch is required" });
        }

        // Find all students from the batch
        const students = await Student.find({
            batch: { $regex: new RegExp('^' + batch + '$', 'i') }
        }).select('_id firstName lastName email class batch');

        if (students.length === 0) {
            return res.status(200).json({
                total_responses: 0,
                students_count: 0,
                responses: [],
                message: `No students found in batch ${batch}`
            });
        }

        const studentIds = students.map((s) => s._id);
        let query = { student_id: { $in: studentIds } };

        if (student_id) {
            if (!studentIds.includes(mongoose.Types.ObjectId(student_id))) {
                return res.status(404).json({ message: "Student not found in this batch" });
            }
            query.student_id = mongoose.Types.ObjectId(student_id);
        }

        // Fetch responses without cutting fields
        const responses = await Response.find(query)
            .populate({
                path: 'student_id',
                select: 'firstName lastName email class batch',
            })
            .populate({
                path: 'assignment_id',
                select: 'assignment_name description due_date'
            })
            .populate({
                path: 'question_id',
                select: 'title description question_text'
            })
            .sort({ created_at: -1 });

        const formattedResponses = responses.map(response => {
            if (!response.student_id) return null;

            const resObj = response.toObject();
            
            // Format test results properly
            if (resObj.test_results && Array.isArray(resObj.test_results.allResults)) {
                resObj.test_results.allResults = resObj.test_results.allResults.map(result => ({
                    ...result,
                    id: result.id?.toString() || null // Convert ObjectId to string or null if missing
                }));
            }

            return {
                ...resObj,
                student_id: {
                    _id: response.student_id._id,
                    name: `${response.student_id.firstName} ${response.student_id.lastName}` || 'Unknown Student',
                    email: response.student_id.email,
                    class: response.student_id.class,
                    batch: response.student_id.batch
                },
                assignment_id: response.assignment_id ? {
                    _id: response.assignment_id._id,
                    assignment_name: response.assignment_id.assignment_name,
                    description: response.assignment_id.description,
                    due_date: response.assignment_id.due_date
                } : null,
                question_id: response.question_id ? {
                    _id: response.question_id._id,
                    title: response.question_id.title,
                    description: response.question_id.description,
                    question_text: response.question_id.question_text
                } : null
            };
        }).filter(Boolean); // Remove nulls

        return res.json({
            total_responses: formattedResponses.length,
            students_count: students.length,
            responses: formattedResponses
        });

    } catch (error) {
        console.error("Error fetching responses:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

// Add performance report endpoint
router.get('/performance-report', authMiddleware, async (req, res) => {
    try {
        const { response_id } = req.query;

        if (!response_id) {
            return res.status(400).json({ message: "Response ID is required" });
        }

        // Find the response and populate required fields
        const response = await Response.findById(response_id)
            .populate('assignment_id', 'assignment_name')
            .populate('student_id', 'firstName lastName class batch');

        if (!response) {
            return res.status(404).json({ message: "Response not found" });
        }

        // Get all responses for the same assignment
        const allResponses = await Response.find({ 
            assignment_id: response.assignment_id._id 
        });

        // Calculate performance metrics
        const performance = {
            total_responses: allResponses.length,
            avg_marks: allResponses.reduce((acc, r) => acc + (r.marks_obtained || 0), 0) / allResponses.length,
            max_marks: Math.max(...allResponses.map(r => r.marks_obtained || 0)),
            min_marks: Math.min(...allResponses.map(r => r.marks_obtained || 0)),
            student_name: `${response.student_id.firstName} ${response.student_id.lastName}`,
            student_class: response.student_id.class,
            student_batch: response.student_id.batch
        };

        res.json({
            assignment_name: response.assignment_id.assignment_name,
            performance
        });

    } catch (error) {
        console.error("Error generating performance report:", error);
        res.status(500).json({ 
            message: 'Error generating performance report', 
            error: error.message 
        });
    }
});

module.exports = router;
