const mongoose = require("mongoose");
require("dotenv").config();

const ConnectionDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(error);
        process.exit(0);
    }
};

module.exports = ConnectionDB;