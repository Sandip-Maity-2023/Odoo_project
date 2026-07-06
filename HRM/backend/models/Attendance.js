const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true },
  date: { type: Date, required: true },
  shift: {
    type: {
      type: String,
      enum: ['Fixed Shift', 'Flexible Shift'],
      default: 'Fixed Shift'
    },
    scheduledStart: { type: String, default: '09:30' },
    scheduledEnd: { type: String, default: '18:30' },
    requiredHours: { type: Number, default: 8 },
    minimumHalfDayHours: { type: Number, default: 4 },
    weeklyOff: [{ type: Number, default: [0, 6] }]
  },
  checkIn: Date,
  checkOut: Date,
  breakDurationMinutes: { type: Number, default: 60 },
  workHours: { type: Number, default: 0 },
  extraHours: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Present', 'Late', 'Half Day', 'Leave', 'Holiday', 'Weekend', 'Absent'],
    default: 'Absent'
  },
  leaveType: String,
  remarks: String,
  correction: {
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  auditTrail: [{
    action: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
