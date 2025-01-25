const express = require('express');
const router = express.Router();
const Response = require('../../models/Response');
const Assignment = require('../../models/Assignment');
const authMiddleware = require('../../middleware/fetchadmin');

// Fetch Responses for a Specific Assignment
router.get('/fetch-responses', authMiddleware, async (req, res) => {
    try {
        const { 
            assignment_id, 
            student_id, 
            status 
        } = req.query;

        // Verify assignment belongs to the teacher
        const assignment = await Assignment.findOne({ 
            _id: assignment_id, 
            teacher_id: req.user._id 
        });

        if (!assignment) {
            return res.status(404).json({ 
                message: 'Assignment not found or unauthorized' 
            });
        }

        // Build query object
        const query = { assignment_id };
        if (student_id) query.student_id = student_id;
        if (status) query.status = status;

        const responses = await Response.find(query)
            .populate('student_id', 'name email')
            .populate('question_id');

        const total = await Response.countDocuments(query);

        res.status(200).json({
            total,
            responses
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching responses', 
            error: error.message 
        });
    }
});

// Bulk Evaluate Responses
router.put('/bulk-evaluate', authMiddleware, async (req, res) => {
    try {
        const { 
            assignment_id, 
            responses 
        } = req.body;

        // Verify assignment belongs to the teacher
        const assignment = await Assignment.findOne({ 
            _id: assignment_id, 
            teacher_id: req.user._id 
        });

        if (!assignment) {
            return res.status(404).json({ 
                message: 'Assignment not found or unauthorized' 
            });
        }

        const bulkWriteOperations = responses.map(response => ({
            updateOne: {
                filter: { 
                    _id: response._id, 
                    assignment_id: assignment_id 
                },
                update: {
                    marks_obtained: response.marks_obtained,
                    remarks: response.remarks,
                    status: 'evaluated',
                    evaluated_at: new Date()
                }
            }
        }));

        const result = await Response.bulkWrite(bulkWriteOperations);

        res.status(200).json({
            message: 'Responses evaluated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error evaluating responses', 
            error: error.message 
        });
    }
});

// Assignment Performance Report
router.get('/performance-report', authMiddleware, async (req, res) => {
    try {
        const { 
            assignment_id, 
            student_id 
        } = req.query;

        // Verify assignment belongs to the teacher
        const assignment = await Assignment.findOne({ 
            _id: assignment_id, 
            teacher_id: req.user._id 
        });

        if (!assignment) {
            return res.status(404).json({ 
                message: 'Assignment not found or unauthorized' 
            });
        }

        // Build query for performance report
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
            assignment: assignment.assignment_name,
            performance: performanceReport[0] || {}
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error generating performance report', 
            error: error.message 
        });
    }
});

module.exports = router;
