const express = require('express');
const router = express.Router();
const Question = require('../../models/Question');
const authMiddleware = require('../../middleware/fetchadmin');
const moment = require('moment-timezone');


// Create a new question
router.post('/create-question', authMiddleware, async (req, res) => {
    try {
        const { 
            question_text, 
            example_input_output,               
            marks,                  
            test_cases,                             
            subject         
        } = req.body;

        // Validate input
        if (!question_text || !marks || !test_cases || !example_input_output) {
            return res.status(400).json({ 
                message: 'Missing required fields' 
            });
        }

        // Create new question
        const newQuestion = new Question({
            question_text,
            example_input_output,
            marks,
            test_cases,
            createdBy: req.user._id,
            subject
        });

        // Save question
        const savedQuestion = await newQuestion.save();

        res.status(201).json({
            message: 'Question created successfully',
            question: savedQuestion
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating question', 
            error: error.message 
        });
    }
});

// Get questions created by logged-in teacher
router.get('/fetch-questions', authMiddleware, async (req, res) => {
    try {
        const questions = await Question.find({ 
            createdBy: req.user._id 
        });
        res.status(200).json({
            total: questions.length,
            questions
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching questions', 
            error: error.message 
        });
    }
});

router.get('/fetch-question/:id', authMiddleware, async (req, res) => {
    try {
        const question = await Question.findOne({ 
            _id: req.params.id, 
            createdBy: req.user._id 
        });

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching question details', 
            error: error.message 
        });
    }
});

// Update a specific question
router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const question = await Question.findOneAndUpdate(
            { _id: id, createdBy: req.user._id },
            updateData,
            { new: true }
        );

        if (!question) {
            return res.status(404).json({ 
                message: 'Question not found' 
            });
        }

        res.status(200).json({
            message: 'Question updated successfully',
            question
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating question', 
            error: error.message 
        });
    }
});

// Delete a specific question
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findOneAndDelete({ 
            _id: id, 
            createdBy: req.user._id 
        });

        if (!question) {
            return res.status(404).json({ 
                message: 'Question not found' 
            });
        }

        res.status(200).json({ 
            message: 'Question deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting question', 
            error: error.message 
        });
    }
});

module.exports = router;