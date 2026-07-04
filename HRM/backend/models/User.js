const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Employee'], default: 'Employee' },
  companyName: String,
  profile: {
    firstName: String,
    lastName: String,
    department: String,
    jobPosition: String,
    status: { type: String, default: 'Absent' }, // Present, Absent, Leave
    salary: {
      basic: Number,
      hra: Number,
      performanceBonus: Number,
      pf: Number
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
