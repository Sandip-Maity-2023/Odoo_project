const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  customId: { type: String, unique: true, sparse: true }, // Format matching user spec rules
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  name: { type: String, required: true }, // Full concatenated string name
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'HR', 'Employee'], default: 'Employee' },
  joiningYear: { type: Number, default: () => new Date().getFullYear() },
  isFirstLogin: { type: Boolean, default: true }, // Verification check routing toggle flag
  
  // Attendance real-time track block references
  attendanceStatus: { type: String, enum: ['present', 'leave', 'absent'], default: 'absent' },

  // Base profile layout structures (Matching tabs from layout designs)
  privateInfo: {
    dob: { type: String, default: '' },
    residingAddress: { type: String, default: '' },
    nationality: { type: String, default: 'Indian' },
    personalEmail: { type: String, default: '' },
    gender: { type: String, default: '' },
    maritalStatus: { type: String, default: '' },
    dateOfJoining: { type: String, default: '' }
  },
  securityInfo: {
    accountNumber: { type: String, default: '' },
    bankName: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    panNo: { type: String, default: '' },
    uanNo: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
