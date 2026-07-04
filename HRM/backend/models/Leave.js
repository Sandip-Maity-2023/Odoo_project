const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    leaveType: { type: String, enum: ['Paid', 'Sick', 'Unpaid'] },
    startDate: Date,
    endDate: Date,
    reason: String,
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    adminComment: String
});

module.exports = mongoose.model('Leave', leaveSchema);
