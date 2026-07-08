const Leave = require('../models/Leave');
const LeaveAllocation = require('../models/LeaveAllocation');
const User = require('../models/User');

const holidays = ['2026-01-26', '2026-08-15', '2026-10-02', '2026-12-25'];
const canManageLeave = (user) => ['Admin', 'HR'].includes(user.role);

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const dateKey = (date) => new Date(date).toISOString().slice(0, 10);

const calculateDays = (start, end) => {
  const startDate = startOfDay(start);
  const endDate = startOfDay(end);
  if (endDate < startDate) return 0;
  let days = 0;
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const day = date.getDay();
    if (day !== 0 && day !== 6 && !holidays.includes(dateKey(date))) days += 1;
  }
  return days;
};

const serializeLeave = (leave) => ({
  id: leave._id,
  employeeId: leave.employeeId,
  employeeName: leave.employeeName,
  department: leave.department,
  leaveType: leave.leaveType,
  startDate: dateKey(leave.startDate),
  endDate: dateKey(leave.endDate),
  totalDays: leave.totalDays,
  reason: leave.reason,
  status: leave.status,
  appliedDate: dateKey(leave.appliedDate || leave.createdAt),
  approvalRemarks: leave.approvalRemarks,
  attachment: leave.attachment?.data ? {
    fileName: leave.attachment.fileName,
    mimeType: leave.attachment.mimeType,
    data: leave.attachment.data,
  } : null,
});

exports.listLeaves = async (req, res) => {
  const companyUsers = canManageLeave(req.user) ? await User.find({ company_id: req.user.company_id }).select('_id') : [];
  const query = canManageLeave(req.user) ? { userId: { $in: companyUsers.map((user) => user._id) } } : { userId: req.user.id };
  const { employeeId, status, leaveType, department, startDate, endDate } = req.query;
  if (employeeId && canManageLeave(req.user)) query.employeeId = employeeId;
  if (status) query.status = status;
  if (leaveType) query.leaveType = leaveType;
  if (department && canManageLeave(req.user)) query.department = department;
  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = startOfDay(startDate);
    if (endDate) query.startDate.$lte = startOfDay(endDate);
  }
  const leaves = await Leave.find(query).sort({ createdAt: -1 });
  res.json({ leaves: leaves.map(serializeLeave) });
};

exports.createLeave = async (req, res) => {
  const { leaveType, startDate, endDate, reason, attachment } = req.body;
  const totalDays = calculateDays(startDate, endDate);
  if (!leaveType || !startDate || !endDate || !reason) return res.status(400).json({ message: 'All leave fields are required' });
  if (totalDays <= 0) return res.status(400).json({ message: 'Leave date range must include at least one working day' });
  if (leaveType === 'Sick Leave' && req.body.sickAttachmentRequired && !attachment) return res.status(400).json({ message: 'Attachment is required for sick leave' });

  const overlap = await Leave.findOne({
    userId: req.user.id,
    status: { $in: ['Pending', 'Approved'] },
    startDate: { $lte: startOfDay(endDate) },
    endDate: { $gte: startOfDay(startDate) },
  });
  if (overlap) return res.status(409).json({ message: 'Leave request overlaps with an existing leave' });

  if (leaveType !== 'Unpaid Leave') {
    const allocation = await LeaveAllocation.findOne({ userId: req.user.id, leaveType });
    if (allocation && allocation.remainingDays < totalDays) return res.status(400).json({ message: 'Requested days exceed available balance' });
  }

  const name = `${req.user.first_name || req.user.profile?.firstName || ''} ${req.user.last_name || req.user.profile?.lastName || ''}`.trim() || req.user.email;
  const leave = await Leave.create({
    userId: req.user.id,
    employeeId: req.user.login_id || req.user.employeeId,
    employeeName: name,
    department: req.user.profile?.department || 'General',
    leaveType,
    startDate: startOfDay(startDate),
    endDate: startOfDay(endDate),
    totalDays,
    reason,
    attachment,
    auditTrail: [{ action: 'SUBMITTED', by: req.user.id, note: reason }]
  });
  res.status(201).json({ message: 'Leave request submitted', leave: serializeLeave(leave) });
};

exports.reviewLeave = async (req, res) => {
  if (!canManageLeave(req.user)) return res.status(403).json({ message: 'Only Admin or HR can review leave' });
  const { status, approvalRemarks = '' } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) return res.status(400).json({ message: 'Invalid review status' });
  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: 'Leave request not found' });
  leave.status = status;
  leave.approvedBy = req.user.id;
  leave.approvalDate = new Date();
  leave.approvalRemarks = approvalRemarks;
  leave.auditTrail.push({ action: status.toUpperCase(), by: req.user.id, note: approvalRemarks });
  await leave.save();

  if (status === 'Approved' && leave.leaveType !== 'Unpaid Leave') {
    const allocation = await LeaveAllocation.findOne({ userId: leave.userId, leaveType: leave.leaveType });
    if (allocation) {
      allocation.usedDays += leave.totalDays;
      allocation.remainingDays = Math.max(0, allocation.allocatedDays - allocation.usedDays);
      allocation.auditTrail.push({ action: 'LEAVE_DEDUCTED', by: req.user.id, note: `${leave.totalDays} days approved` });
      await allocation.save();
    }
  }
  res.json({ message: `Leave ${status.toLowerCase()}`, leave: serializeLeave(leave) });
};

exports.cancelLeave = async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: 'Leave request not found' });
  if (!canManageLeave(req.user) && String(leave.userId) !== String(req.user.id)) return res.status(403).json({ message: 'Access denied' });
  if (leave.status !== 'Pending') return res.status(400).json({ message: 'Only pending leave can be cancelled' });
  leave.status = 'Cancelled';
  leave.auditTrail.push({ action: 'CANCELLED', by: req.user.id, note: 'Leave cancelled' });
  await leave.save();
  res.json({ message: 'Leave cancelled', leave: serializeLeave(leave) });
};

exports.listAllocations = async (req, res) => {
  const companyUsers = canManageLeave(req.user) ? await User.find({ company_id: req.user.company_id }).select('_id') : [];
  const query = canManageLeave(req.user) ? { userId: { $in: companyUsers.map((user) => user._id) } } : { userId: req.user.id };
  const allocations = await LeaveAllocation.find(query).sort({ employeeName: 1, leaveType: 1 });
  res.json({ allocations });
};

exports.upsertAllocation = async (req, res) => {
  if (!canManageLeave(req.user)) return res.status(403).json({ message: 'Only Admin or HR can manage allocations' });
  const { userId, leaveType, allocatedDays } = req.body;
  const employee = await User.findById(userId);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  if (String(employee.company_id) !== String(req.user.company_id)) return res.status(403).json({ message: 'Access denied' });
  const used = Number(req.body.usedDays || 0);
  const name = `${employee.first_name} ${employee.last_name}`.trim();
  const allocation = await LeaveAllocation.findOneAndUpdate(
    { userId, leaveType },
    {
      userId,
      employeeId: employee.login_id || employee.employeeId,
      employeeName: name,
      department: employee.profile?.department || 'General',
      leaveType,
      allocatedDays: Number(allocatedDays),
      usedDays: used,
      remainingDays: Math.max(0, Number(allocatedDays) - used),
      $push: { auditTrail: { action: 'ALLOCATION_UPDATED', by: req.user.id, note: `${leaveType}: ${allocatedDays}` } }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ allocation });
};
