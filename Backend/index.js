require("dotenv").config();
const ConnectionDB = require("./database");
const express = require("express");
const cors = require("cors");
const cron = require('node-cron');
const path = require("path");
const mongoose = require('mongoose');


ConnectionDB();


const app = express()

const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.listen(port, () => {
    console.log(` backend listening at http://localhost:${port}`)
  })