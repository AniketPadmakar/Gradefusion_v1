require("dotenv").config();
const ConnectionDB = require("./database");
const express = require("express");
const cors = require("cors");
const cron = require('node-cron');
const path = require("path");
const mongoose = require('mongoose');
require('./models/student');
require('./models/Teacher');
require('./models/Assignment');
require('./models/Question');
require('./models/Response');
require('./models/course');



ConnectionDB();


const app = express()

const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.use("/app/student", require('./routes/user/auth'));
app.use("/app/teacher", require('./routes/admin/auth'));
app.use("/app/teacher", require('./routes/admin/question-routes'));

app.listen(port, () => {
    console.log(` backend listening at http://localhost:${port}`)
  })