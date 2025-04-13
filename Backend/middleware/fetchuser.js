const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Student = mongoose.model('Student');

module.exports = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        
        if (!authorization) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const token = authorization.replace("Bearer ", "");
        
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!payload || (!payload.userId && !payload._id)) {
            return res.status(401).json({ error: "Invalid token" });
        }

        // Try both userId and _id since different parts might use different conventions
        const userId = payload.userId || payload._id;
        
        const user = await Student.findById(userId);
        
        if (!user) {
            return res.status(401).json({ error: "Student not found" });
        }

        // Set both id and _id to ensure compatibility
        req.user = {
            id: user._id,
            _id: user._id,
            ...user._doc
        };
        
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ error: "Authentication failed" });
    }
}