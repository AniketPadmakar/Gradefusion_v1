const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Student = mongoose.model('Student');
const moment = require('moment-timezone');


router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password, class: studentClass, batch } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !email || !password || !studentClass || !batch) {
            return res.status(400).json({ error: "All fields are required" });
        }
        
        // Check if the student already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(409).json({ error: "Email already in use" });
        }
        
        const student = new Student({ 
            firstName, 
            lastName, 
            email, 
            password, 
            class: studentClass, 
            batch 
        });
        
        await student.save();
        
        const token = jwt.sign({ userId: student._id }, process.env.JWT_SECRET);
        
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
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        
        const isPasswordValid = await student.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        
        const token = jwt.sign({ userId: student._id }, process.env.JWT_SECRET);
        
        // Send the token as a JSON response
        return res.status(200).json({ message: "Signin successful", token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;