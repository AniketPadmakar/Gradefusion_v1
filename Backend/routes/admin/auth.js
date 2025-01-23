const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Teacher = mongoose.model('Teacher');

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password, subject } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !email || !password || !subject) {
            return res.status(400).json({ error: "All fields are required" });
        }
        
        // Check if the teacher already exists
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(409).json({ error: "Email already in use" });
        }
        
        const teacher = new Teacher({ 
            firstName, 
            lastName, 
            email, 
            password, 
            subject 
        });
        
        await teacher.save();
        
        const token = jwt.sign({ userId: teacher._id }, process.env.JWT_SECRET);
        
        // Send the token as a JSON response
        return res.status(201).json({ message: "Signup successful", token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error during signup" });
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    
    try {
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        
        const isPasswordValid = await teacher.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        
        const token = jwt.sign({ userId: teacher._id }, process.env.JWT_SECRET);
        
        // Send the token as a JSON response
        return res.status(200).json({ message: "Signin successful", token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;