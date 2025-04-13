const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const moment = require('moment-timezone');

// Student Schema
const StudentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  class: { type: String, required: true },
  batch: { type: String, required: true },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  created_at: { 
    type: String, 
    default: () => moment().tz("Asia/Kolkata").format("DD/MM/YYYY :: HH:mm:ss") 
  },
  updated_at: { 
    type: String, 
    default: () => moment().tz("Asia/Kolkata").format("DD/MM/YYYY :: HH:mm:ss") 
  },
});

StudentSchema.pre('save', function (next) {
  const Student = this;
  if (!Student.isModified('password')) {
      return next()
  }
  bcrypt.genSalt(10, (err, salt) => {
      if (err) {
          return next(err)
      }

      bcrypt.hash(Student.password, salt, (err, hash) => {
          if (err) {
              return next(err)
          }
          Student.password = hash;
          next()
      })
  })

})

StudentSchema.methods.comparePassword = function (candidatePassword) {
  const Student = this;
  return new Promise((resolve, reject) => {
      bcrypt.compare(candidatePassword, Student.password, (err, isMatch) => {
          if (err) {
              return reject(err);
          }
          resolve(isMatch);
      });
  });
}
module.exports = mongoose.model('Student', StudentSchema);
