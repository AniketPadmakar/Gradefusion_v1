const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const moment = require('moment-timezone');


// Teacher Schema
const TeacherSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    subject: { type: String, required: true },
    assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    created_at: { 
        type: String, 
        default: () => moment().tz("Asia/Kolkata").format("DD/MM/YYYY :: HH:mm:ss") 
      },
      updated_at: { 
        type: String, 
        default: () => moment().tz("Asia/Kolkata").format("DD/MM/YYYY :: HH:mm:ss") 
      },
  });


  TeacherSchema.pre('save', function (next) {
  const Teacher = this;
  if (!Teacher.isModified('password')) {
      return next()
  }
  bcrypt.genSalt(10, (err, salt) => {
      if (err) {
          return next(err)
      }

      bcrypt.hash(Teacher.password, salt, (err, hash) => {
          if (err) {
              return next(err)
          }
          Teacher.password = hash;
          next()
      })
  })

})

TeacherSchema.methods.comparePassword = function (candidatePassword) {
  const Teacher = this;
  return new Promise((resolve, reject) => {
      bcrypt.compare(candidatePassword, Teacher.password, (err, isMatch) => {
          if (err) {
              return reject(err)
          }
          if (!isMatch) {
              return reject(err)
          }
          resolve(true)
      })
  })
}
  
module.exports = mongoose.model('Teacher', TeacherSchema);