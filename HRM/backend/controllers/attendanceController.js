const Attendance = require('../models/Attendance');
const User = require('../models/User');

exports.checkIn = async (req, res) => {
    const today = new Date().setHours(0,0,0,0);
    let record = await Attendance.findOne({ userId: req.user.id, date: today });

    if (record) return res.status(400).json({ message: "Already checked in today" });

    record = new Attendance({
        userId: req.user.id,
        checkIn: new Date(),
        date: today,
        status: 'Present' // Default to present on check-in
    });

    await record.save();
    // Update user status for the dashboard "Dot"
    await User.findByIdAndUpdate(req.user.id, { "profile.status": "Present" });
    res.json(record);
};

exports.checkOut = async (req, res) => {
    const today = new Date().setHours(0,0,0,0);
    const record = await Attendance.findOne({ userId: req.user.id, date: today });

    if (!record) return res.status(404).json({ message: "No check-in record found" });

    record.checkOut = new Date();
    
    // Logic for Half-day (Requirement 3.4.1)
    const hoursWorked = (record.checkOut - record.checkIn) / (1000 * 60 * 60);
    if (hoursWorked < 4) record.status = 'Half-day';

    await record.save();
    await User.findByIdAndUpdate(req.user.id, { "profile.status": "Absent" });
    res.json(record);
};
