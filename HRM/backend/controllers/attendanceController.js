const Attendance = require('../models/Attendance');
const User = require('../models/User');

const DEFAULT_SHIFT = {
    type: 'Fixed Shift',
    scheduledStart: '09:30',
    scheduledEnd: '18:30',
    requiredHours: 8,
    minimumHalfDayHours: 4,
    weeklyOff: [0, 6]
};

const startOfDay = (value = new Date()) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

const getStatus = (record) => {
    const day = new Date(record.date).getDay();
    if (!record.checkIn && record.shift.weeklyOff.includes(day)) return 'Weekend';
    if (!record.checkIn) return 'Absent';
    if (!record.checkOut) return 'Present';
    if (record.workHours < record.shift.minimumHalfDayHours) return 'Half Day';

    const [hour, minute] = record.shift.scheduledStart.split(':').map(Number);
    const scheduledStart = new Date(record.date);
    scheduledStart.setHours(hour, minute, 0, 0);
    if (record.checkIn > scheduledStart) return 'Late';
    return 'Present';
};

const serialize = (record) => ({
    id: record._id,
    employeeId: record.employeeId,
    date: record.date,
    shift: record.shift,
    checkIn: record.checkIn,
    checkOut: record.checkOut,
    breakDurationMinutes: record.breakDurationMinutes,
    workHours: record.workHours,
    extraHours: record.extraHours,
    status: record.status,
    leaveType: record.leaveType,
    remarks: record.remarks,
});

exports.checkIn = async (req, res) => {
    const today = startOfDay();
    let record = await Attendance.findOne({ userId: req.user.id, date: today });

    if (record?.checkIn) return res.status(400).json({ message: "Already checked in today" });

    record = new Attendance({
        userId: req.user.id,
        employeeId: req.user.login_id || req.user.employeeId,
        checkIn: new Date(),
        date: today,
        shift: DEFAULT_SHIFT,
        status: 'Present',
        auditTrail: [{ action: 'CHECK_IN', by: req.user.id, note: 'Employee checked in' }]
    });

    await record.save();
    // Update user status for the dashboard "Dot"
    await User.findByIdAndUpdate(req.user.id, { "profile.status": "Present" });
    res.json(serialize(record));
};

exports.checkOut = async (req, res) => {
    const today = startOfDay();
    const record = await Attendance.findOne({ userId: req.user.id, date: today });

    if (!record) return res.status(404).json({ message: "No check-in record found" });
    if (record.checkOut) return res.status(400).json({ message: "Already checked out today" });

    record.checkOut = new Date();
    const grossMinutes = Math.max(0, Math.round((record.checkOut - record.checkIn) / 60000));
    const netMinutes = Math.max(0, grossMinutes - record.breakDurationMinutes);
    record.workHours = Number((netMinutes / 60).toFixed(2));
    record.extraHours = Number(Math.max(0, record.workHours - record.shift.requiredHours).toFixed(2));
    record.status = getStatus(record);
    record.auditTrail.push({ action: 'CHECK_OUT', by: req.user.id, note: `Worked ${record.workHours} hours` });

    await record.save();
    await User.findByIdAndUpdate(req.user.id, { "profile.status": "Absent" });
    res.json(serialize(record));
};

exports.listAttendance = async (req, res) => {
    const { employeeId, status, department, date, month } = req.query;
    const query = {};
    const canViewAll = ['Admin', 'HR'].includes(req.user.role);

    if (!canViewAll) {
        query.userId = req.user.id;
    } else if (employeeId) {
        query.employeeId = employeeId;
    }

    if (status) query.status = status;
    if (date) {
        query.date = startOfDay(date);
    } else if (month) {
        const [year, monthIndex] = month.split('-').map(Number);
        query.date = { $gte: new Date(year, monthIndex - 1, 1), $lt: new Date(year, monthIndex, 1) };
    }

    const records = await Attendance.find(query).populate('userId', 'first_name last_name login_id profile role').sort({ date: -1 });
    const filtered = department && canViewAll
        ? records.filter((record) => record.userId?.profile?.department === department)
        : records;

    res.json({ records: filtered.map(serialize) });
};

exports.correctAttendance = async (req, res) => {
    if (!['Admin', 'HR'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Only Admin or HR can approve attendance corrections' });
    }

    const { id } = req.params;
    const updates = req.body;
    const record = await Attendance.findById(id);
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });

    ['checkIn', 'checkOut', 'breakDurationMinutes', 'remarks', 'status'].forEach((field) => {
        if (updates[field] !== undefined) record[field] = updates[field];
    });
    if (record.checkIn && record.checkOut) {
        const grossMinutes = Math.max(0, Math.round((record.checkOut - record.checkIn) / 60000));
        const netMinutes = Math.max(0, grossMinutes - record.breakDurationMinutes);
        record.workHours = Number((netMinutes / 60).toFixed(2));
        record.extraHours = Number(Math.max(0, record.workHours - record.shift.requiredHours).toFixed(2));
        record.status = updates.status || getStatus(record);
    }
    record.auditTrail.push({ action: 'MANUAL_CORRECTION', by: req.user.id, note: updates.remarks || 'Attendance corrected' });
    await record.save();
    res.json(serialize(record));
};
