const express = require('express');
const moment = require('moment-timezone');
const router = express.Router();
const Assignment = require('../../models/Assignment');
const Student = require('../../models/student');
const Course = require('../../models/course');
const dateUtils = require('../../utils/dateUtils');
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
            start_at,
            due_at, 
            marks 
        } = req.body;

        // Convert and validate dates using standard format
        const standardizedStartDate = dateUtils.formatToStandard(start_at);
        const standardizedDueDate = dateUtils.formatToStandard(due_at);

        if (!dateUtils.isValidDate(standardizedStartDate) || !dateUtils.isValidDate(standardizedDueDate)) {
            return res.status(400).json({
                message: 'Invalid date format. Use ISO format or DD/MM/YYYY :: HH:mm:ss'
            });
        }

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

        // Create new assignment with standardized dates
        const newAssignment = new Assignment({
            assignment_name,
            course_id,
            questions,
            teacher_id: req.user._id,
            student_ids,
            start_at: standardizedStartDate,
            due_at: standardizedDueDate,
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
        const updateData = { ...req.body };

        // Standardize dates if they exist in the update data
        if (updateData.start_at) {
            const standardizedStartDate = dateUtils.formatToStandard(updateData.start_at);
            if (!dateUtils.isValidDate(standardizedStartDate)) {
                return res.status(400).json({
                    message: 'Invalid start date format. Use ISO format or DD/MM/YYYY :: HH:mm:ss'
                });
            }
            updateData.start_at = standardizedStartDate;
        }

        if (updateData.due_at) {
            const standardizedDueDate = dateUtils.formatToStandard(updateData.due_at);
            if (!dateUtils.isValidDate(standardizedDueDate)) {
                return res.status(400).json({
                    message: 'Invalid due date format. Use ISO format or DD/MM/YYYY :: HH:mm:ss'
                });
            }
            updateData.due_at = standardizedDueDate;
        }

        const assignment = await Assignment.findOneAndUpdate(
            { _id: id, teacher_id: req.user._id },
            updateData,
            { new: true }
        );

        if (!assignment) {
            return res.status(404).json({ 
                message: 'Assignment not found' 
            });
        }

        // Format dates for response
        const formattedAssignment = {
            ...assignment.toObject(),
            start_at: moment(assignment.start_at).format('DD/MM/YYYY :: HH:mm:ss'),
            due_at: moment(assignment.due_at).format('DD/MM/YYYY :: HH:mm:ss')
        };

        res.status(200).json({
            message: 'Assignment updated successfully',
            assignment: formattedAssignment
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

        // Format dates for response with explicit format parsing
        const formattedAssignment = {
            ...assignment.toObject(),
            start_at: moment(assignment.start_at, 'DD/MM/YYYY :: HH:mm:ss').isValid() 
                ? assignment.start_at 
                : moment(assignment.start_at).format('DD/MM/YYYY :: HH:mm:ss'),
            due_at: moment(assignment.due_at, 'DD/MM/YYYY :: HH:mm:ss').isValid() 
                ? assignment.due_at 
                : moment(assignment.due_at).format('DD/MM/YYYY :: HH:mm:ss')
        };

        res.status(200).json({ assignment: formattedAssignment });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching assignment details', 
            error: error.message 
        });
    }
});

module.exports = router;