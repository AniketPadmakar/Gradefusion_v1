const express = require('express');
const router = express.Router();
const Assignment = require('../../models/Assignment');
const authMiddleware = require('../../middleware/fetchadmin');

// Create Assignment
router.post('/create-assignments', authMiddleware, async (req, res) => {
    try {
        const { 
            assignment_name, 
            course_id, 
            questions, 
            student_ids, 
            due_at, 
            marks 
        } = req.body;

        const newAssignment = new Assignment({
            assignment_name,
            course_id,
            questions,
            teacher_id: req.user._id,
            student_ids,
            due_at,
            marks
        });

        const savedAssignment = await newAssignment.save();

        res.status(201).json({
            message: 'Assignment created successfully',
            assignment: savedAssignment
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating assignment', 
            error: error.message 
        });
    }
});

// Fetch Assignments
router.get('/fetch-assignments', authMiddleware, async (req, res) => {
    try {
        const assignments = await Assignment.find({ teacher_id: req.user._id })
            .populate('course_id')
            .populate('questions')
            .populate('student_ids');

        res.status(200).json({
            total: assignments.length,
            assignments
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching assignments', 
            error: error.message 
        });
    }
});

// Update Assignment
router.put('/update-assignments/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const assignment = await Assignment.findOneAndUpdate(
            { _id: id, teacher_id: req.user._id },
            { 
                ...req.body, 
                updated_at: new Date() 
            },
            { new: true }
        );

        if (!assignment) {
            return res.status(404).json({ 
                message: 'Assignment not found' 
            });
        }

        res.status(200).json({
            message: 'Assignment updated successfully',
            assignment
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating assignment', 
            error: error.message 
        });
    }
});

// Delete Assignment
router.delete('/delete-assignments/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const assignment = await Assignment.findOneAndDelete({ 
            _id: id, 
            teacher_id: req.user._id 
        });

        if (!assignment) {
            return res.status(404).json({ 
                message: 'Assignment not found' 
            });
        }

        res.status(200).json({ 
            message: 'Assignment deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting assignment', 
            error: error.message 
        });
    }
});

// Fetch Single Assignment
router.get('/fetch-single-assignment/:id', authMiddleware, async (req, res) => {
    try {
        const assignment = await Assignment.findOne({ 
            _id: req.params.id, 
            teacher_id: req.user._id 
        })
        .populate('course_id')
        .populate('questions')
        .populate('student_ids');

        if (!assignment) {
            return res.status(404).json({ 
                message: 'Assignment not found' 
            });
        }

        res.status(200).json({ assignment });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching assignment details', 
            error: error.message 
        });
    }
});

module.exports = router;