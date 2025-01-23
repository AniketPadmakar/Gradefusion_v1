const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

// Teacher Schema
const TeacherSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subject: { type: String, required: true },
    assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
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
  
  const Teacher = mongoose.model('Teacher', TeacherSchema);