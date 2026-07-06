const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  login_id: { type: String, unique: true, required: true },
  employeeId: { type: String, unique: true, required: true },
  first_name: { type: String, required: true, trim: true },
  last_name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password_hash: { type: String, required: true },
  password: { type: String, required: true },
  temporary_password: { type: String },
  must_change_password: { type: Boolean, default: true },
  joining_year: { type: Number, required: true },
  serial_number: { type: Number, required: true },
  role: { type: String, enum: ['Admin', 'HR', 'Employee'], default: 'Employee' },
  companyName: String,
  isFirstLogin: { type: Boolean, default: true },
  refresh_tokens: [{ type: String }],
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: {
      data: String,
      mimeType: String,
      fileName: String,
    },
    resume: mongoose.Schema.Types.Mixed,
    privateInfo: mongoose.Schema.Types.Mixed,
    address: String,
    manager: String,
    location: String,
    department: String,
    jobPosition: String,
    status: { type: String, default: 'Absent' }, // Present, Absent, Leave
    salary: {
      basic: Number,
      hra: Number,
      performanceBonus: Number,
      pf: Number
    }
  },
  created_at: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.index({ company_id: 1, joining_year: 1, serial_number: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
