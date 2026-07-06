const mongoose = require('mongoose');

const leaveAllocationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: String,
  leaveType: { type: String, enum: ['Paid Leave', 'Sick Leave', 'Unpaid Leave', 'Casual Leave'], required: true },
  allocatedDays: { type: Number, default: 0 },
  usedDays: { type: Number, default: 0 },
  remainingDays: { type: Number, default: 0 },
  auditTrail: [{
    action: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

leaveAllocationSchema.index({ userId: 1, leaveType: 1 }, { unique: true });

module.exports = mongoose.model('LeaveAllocation', leaveAllocationSchema);
