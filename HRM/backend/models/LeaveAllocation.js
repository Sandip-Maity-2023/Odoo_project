const mongoose = require('mongoose');

const leaveAllocationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: String,
  leaveType: { type: String, enum: ['Paid Leave', 'Sick Leave', 'Unpaid Leave', 'Casual Leave'], required: true }, //An enum (short for enumeration) is a special data type in computer programming used to define a fixed set of named constants.
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


//This is a standard Mongoose schema definition for an embedded subdocument array used to track history, changes, or logs (an audit trail) within a MongoDB document.Field BreakdownauditTrail: An array that stores a list of historical action objects.action: A string describing what happened (e.g., 'created', 'updated', 'approved').by: Stores the MongoDB ObjectId of the user who performed the action. It references (ref) a 'User' model, allowing you to use Mongoose .populate('auditTrail.by') to fetch user details later.at: The timestamp of the action. It defaults to the current date and time (Date.now) if not provided.note: An optional text field for extra context, reasons, or comments regarding the change.
