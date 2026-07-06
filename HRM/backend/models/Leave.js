const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: String,
  leaveType: { type: String, enum: ['Paid Leave', 'Sick Leave', 'Unpaid Leave', 'Casual Leave'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  reason: { type: String, required: true },
  attachment: {
    fileName: String,
    mimeType: String,
    data: String,
  },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalDate: Date,
  approvalRemarks: String,
  appliedDate: { type: Date, default: Date.now },
  auditTrail: [{
    action: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

leaveSchema.index({ userId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Leave', leaveSchema);
