const express = require('express');
const router = express.Router();
const Assignment = require('../../models/Assignment');
const Student = require('../../models/student');
const Response = require('../../models/Response');
const authMiddleware = require('../../middleware/fetchadmin');
const moment = require('moment-timezone');


// Reopen Assignment
router.post('/reopen-assignments/:assignmentId', authMiddleware, async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { studentId, reopenForAll } = req.body;

        // Find the assignment
        const assignment = await Assignment.findOne({ 
            _id: assignmentId,
            teacher_id: req.user._id 
        });

        if (!assignment) {
            return res.status(404).json({ 
                message: 'Assignment not found' 
            });
        }

        let updatedResponses;

        if (reopenForAll) {
            // Update all responses for this assignment
            updatedResponses = await Response.updateMany(
                { assignment_id: assignmentId },
                {
                    status: 'reopened',
                    updated_at: new Date(),
                    $inc: { submission_attempts: 1 }
                }
            );

            return res.status(200).json({
                message: 'Assignment reopened successfully for all students',
            });
        } else {
            // Verify student exists in assignment
            if (!assignment.student_ids.includes(studentId)) {
                return res.status(404).json({ 
                    message: 'Student not found in this assignment' 
                });
            }

            // Find and update specific student's response
            const response = await Response.findOne({
                assignment_id: assignmentId,
                student_id: studentId
            });

            if (!response) {
                return res.status(404).json({ 
                    message: 'No response found for this student in the assignment' 
                });
            }

            // Update specific student's response
            const updatedResponse = await Response.findOneAndUpdate(
                {
                    assignment_id: assignmentId,
                    student_id: studentId
                },
                {
                    status: 'reopened',
                    updated_at: moment().tz('Asia/Kolkata').format('DD/MM/YYYY :: HH:mm:ss'),
                    submission_attempts: response.submission_attempts + 1
                },
                { new: true }
            );

            return res.status(200).json({
                message: 'Assignment reopened successfully for the student',
                response: updatedResponse
            });
        }
    } catch (error) {
        res.status(500).json({ 
            message: 'Error reopening assignment', 
            error: error.message 
        });
    }
});

module.exports = router;