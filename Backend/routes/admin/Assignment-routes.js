const express = require('express');
const router = express.Router();
const Assignment = require('../../models/Assignment');
const Student = require('../../models/student');
const Course = require('../../models/course');
const moment = require('moment-timezone');
const authMiddleware = require('../../middleware/fetchadmin');


// Create Assignment
router.post('/create-assignments', authMiddleware, async (req, res) => {
    try {
        const { 
            assignment_name, 
            course_id, 
            questions, 
            class_name,
            batch, 
            due_at, 
            marks 
        } = req.body;

        // Find students matching the class and batch
        const students = await Student.find({ 
            class: class_name, 
            batch: batch 
        });

        // Extract student IDs
        const student_ids = students.map(student => student._id);

        // Validate student existence
        if (student_ids.length === 0) {
            return res.status(400).json({ 
                message: 'No students found for the specified class and batch' 
            });
        }

        // Create new assignment
        const newAssignment = new Assignment({
            assignment_name,
            course_id,
            questions,
            teacher_id: req.user._id,
            student_ids,
            due_at,
            marks
        });

        // Save assignment
        const savedAssignment = await newAssignment.save();

        // Update course with the new assignment
        await Course.findByIdAndUpdate(
            course_id, 
            { $push: { assignments: savedAssignment._id } },
            { new: true }
        );

        res.status(201).json({
            message: 'Assignment created successfully',
            assignment: savedAssignment,
            studentsAdded: student_ids.length
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
                ...req.body
            },
            { new: true }
        );

        if (!assignment) {
            return res.status(404).json({ 
                message: 'Assignment not found' 
            });
        }

        // Check if due_at exists and format it; otherwise, leave it as is
        if (assignment.due_at) {
            assignment.due_at = moment(assignment.due_at).format('DD/MM/YYYY :: HH:mm:ss');
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