import React, { useMemo, useState } from 'react';
import logo from './assets/odoo_img.png';

const PAGE_SIZE = 8;
const API_URL = import.meta.env.VITE_API_URL || '';

const seedEmployees = [
  { id: 1, name: 'Shibashis Das', employeeId: 'OISHDA20260001', jobPosition: 'Frontend Developer', department: 'Engineering', email: 'shibashis@company.com', mobile: '+91 98765 43210', company: 'Odoo India', manager: 'Ananya Sen', location: 'Kolkata', status: 'present' },
  { id: 2, name: 'Sreejith S', employeeId: 'OISRSX20260002', jobPosition: 'HR Executive', department: 'People', email: 'sreejith@company.com', mobile: '+91 98765 43211', company: 'Odoo India', manager: 'Ananya Sen', location: 'Bengaluru', status: 'leave' },
  { id: 3, name: 'Rohit Kumar', employeeId: 'OIROKU20260003', jobPosition: 'Backend Developer', department: 'Engineering', email: 'rohit@company.com', mobile: '+91 98765 43212', company: 'Odoo India', manager: 'Shibashis Das', location: 'Hyderabad', status: 'absent' },
  { id: 4, name: 'Ananya Sen', employeeId: 'OIANSE20260004', jobPosition: 'Payroll Analyst', department: 'Finance', email: 'ananya@company.com', mobile: '+91 98765 43213', company: 'Odoo India', manager: 'Rohit Kumar', location: 'Mumbai', status: 'present' },
  { id: 5, name: 'Nisha Verma', employeeId: 'OINIVE20260005', jobPosition: 'QA Engineer', department: 'Quality', email: 'nisha@company.com', mobile: '+91 98765 43214', company: 'Odoo India', manager: 'Shibashis Das', location: 'Pune', status: 'absent' },
  { id: 6, name: 'Arjun Mehta', employeeId: 'OIARME20260006', jobPosition: 'Product Designer', department: 'Product', email: 'arjun@company.com', mobile: '+91 98765 43215', company: 'Odoo India', manager: 'Ananya Sen', location: 'Delhi', status: 'present' },
  { id: 7, name: 'Priya Nair', employeeId: 'OIPRNA20260007', jobPosition: 'Recruiter', department: 'People', email: 'priya@company.com', mobile: '+91 98765 43216', company: 'Odoo India', manager: 'Sreejith S', location: 'Kochi', status: 'leave' },
  { id: 8, name: 'Kabir Khan', employeeId: 'OIKAKH20260008', jobPosition: 'DevOps Engineer', department: 'Platform', email: 'kabir@company.com', mobile: '+91 98765 43217', company: 'Odoo India', manager: 'Rohit Kumar', location: 'Noida', status: 'absent' },
  { id: 9, name: 'Meera Iyer', employeeId: 'OIMEIY20260009', jobPosition: 'Business Analyst', department: 'Operations', email: 'meera@company.com', mobile: '+91 98765 43218', company: 'Odoo India', manager: 'Ananya Sen', location: 'Chennai', status: 'present' },
];

const statusMeta = {
  present: { label: 'Present', icon: '●', className: 'ems-status present' },
  leave: { label: 'On Leave', icon: '✈', className: 'ems-status leave' },
  absent: { label: 'Absent', icon: '●', className: 'ems-status absent' },
};

const formatDate = (date = new Date()) => date.toLocaleDateString('en-GB');
const formatTime = (date = new Date()) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const toInputDate = (date = new Date()) => date.toISOString().slice(0, 10);
const toMonthValue = (date = new Date()) => date.toISOString().slice(0, 7);
const hoursLabel = (value = 0) => `${Number(value).toFixed(2)}h`;
const attendanceStatuses = ['Present', 'Late', 'Half Day', 'Leave', 'Holiday', 'Weekend', 'Absent'];
const attendanceStatusClass = (status) => `ems-attendance-status ${String(status).toLowerCase().replace(/\s+/g, '-')}`;

const makeAttendanceRows = (employees) => {
  const baseDates = ['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04', '2026-07-05', '2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09', '2026-07-10'];
  return employees.flatMap((employee) => baseDates.map((date, dateIndex) => {
    const day = new Date(date).getDay();
    const isWeekend = day === 0 || day === 6;
    const isLeave = employee.status === 'leave' && dateIndex === 7;
    const isLate = !isWeekend && !isLeave && dateIndex % 5 === 1;
    const isHalfDay = !isWeekend && !isLeave && dateIndex % 7 === 2;
    const isAbsent = !isWeekend && !isLeave && employee.status === 'absent' && dateIndex % 6 === 3;
    const status = isWeekend ? 'Weekend' : isLeave ? 'Leave' : isAbsent ? 'Absent' : isHalfDay ? 'Half Day' : isLate ? 'Late' : 'Present';
    const checkIn = ['Present', 'Late', 'Half Day'].includes(status) ? (isLate ? '10:05' : '09:25') : '-';
    const checkOut = status === 'Half Day' ? '13:25' : ['Present', 'Late'].includes(status) ? '18:45' : '-';
    const breakHours = ['Present', 'Late', 'Half Day'].includes(status) ? 1 : 0;
    const grossHours = checkOut === '-' ? 0 : ((Number(checkOut.slice(0, 2)) * 60 + Number(checkOut.slice(3))) - (Number(checkIn.slice(0, 2)) * 60 + Number(checkIn.slice(3)))) / 60;
    const workHours = Math.max(0, grossHours - breakHours);
    const extraHours = Math.max(0, workHours - 8);
    return { id: `${employee.employeeId}-${date}`, name: employee.name, employeeId: employee.employeeId, department: employee.department, date, shift: 'Fixed Shift', checkIn, checkOut, breakHours, workHours, extraHours, status, leaveType: isLeave ? 'Paid Leave' : '', remarks: status === 'Absent' ? 'No attendance and no approved leave' : '' };
  }));
};

const avatarFor = (name) => `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name || 'Employee')}`;
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` });
const toUiLeave = (leave) => ({
  id: leave.id,
  employeeId: leave.employeeId,
  name: leave.employeeName,
  department: leave.department || 'General',
  type: leave.leaveType,
  start: leave.startDate,
  end: leave.endDate,
  days: leave.totalDays,
  reason: leave.reason,
  status: leave.status,
  appliedDate: leave.appliedDate,
  remarks: leave.approvalRemarks || 'Awaiting approval',
});
const toUiAllocation = (allocation) => ({
  id: allocation._id || allocation.id,
  userId: allocation.userId,
  employeeId: allocation.employeeId,
  name: allocation.employeeName || allocation.name,
  department: allocation.department || 'General',
  leaveType: allocation.leaveType,
  allocatedDays: allocation.allocatedDays,
  usedDays: allocation.usedDays,
  remainingDays: allocation.remainingDays,
});

function ShellNav({ activeModule, onModuleChange, currentUser, onOpenProfile, onLogout }) {
  const [open, setOpen] = useState(false);
  const modules = ['Employees', 'Attendance', 'Time Off'];

  return (
    <header className="ems-topbar">
      <div className="ems-brand">
        <img src={logo} alt="Company Logo" />
        <nav>
          {modules.map((module) => (
            <button key={module} className={activeModule === module ? 'active' : ''} onClick={() => onModuleChange(module)}>
              {module}
            </button>
          ))}
        </nav>
      </div>
      <div className="ems-avatar-menu">
        <button className="ems-avatar-button" onClick={() => setOpen((value) => !value)} aria-label="Open user menu">
          <img src={avatarFor(currentUser.name)} alt={currentUser.name || 'User'} />
        </button>
        {open && (
          <div className="ems-menu-card">
            <button onClick={() => { setOpen(false); onOpenProfile(); }}>My Profile</button>
            <button className="danger" onClick={onLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

function StatCard({ label, value }) {
  return <div className="ems-stat"><span>{label}</span><strong>{value}</strong></div>;
}

function EmployeeCard({ employee, onSelectEmployee }) {
  const status = statusMeta[employee.status] || statusMeta.absent;

  return (
    <button className="ems-employee-card" onClick={() => onSelectEmployee({ ...employee, avatar: avatarFor(employee.name) })}>
      <span className={status.className} title={status.label}>{status.icon}</span>
      <img src={avatarFor(employee.name)} alt={employee.name} />
      <strong>{employee.name}</strong>
      <span>{employee.jobPosition || 'Employee'}</span>
      <small>{employee.department}</small>
      <code>{employee.employeeId}</code>
    </button>
  );
}

function EmployeesView({ employees, canManageEmployees, onSelectEmployee, onNewEmployee, toast }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesQuery = `${employee.name} ${employee.employeeId} ${employee.department}`.toLowerCase().includes(needle);
      const matchesStatus = status === 'all' || employee.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [employees, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="ems-page">
      {toast && <div className={`ems-toast ${toast.type}`}>{toast.message}</div>}
      <section className="ems-hero-row">
        <div>
          <p>Employee Management</p>
          <h1>Dashboard</h1>
        </div>
        {canManageEmployees && <button className="ems-primary" onClick={onNewEmployee}>New Employee</button>}
      </section>

      <section className="ems-stats-grid">
        <StatCard label="Employees" value={employees.length} />
        <StatCard label="Present" value={employees.filter((item) => item.status === 'present').length} />
        <StatCard label="On Leave" value={employees.filter((item) => item.status === 'leave').length} />
        <StatCard label="Absent" value={employees.filter((item) => item.status === 'absent').length} />
      </section>

      <section className="ems-card">
        <div className="ems-toolbar">
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search by name, employee ID, department" />
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
            <option value="all">All status</option>
            <option value="present">Present</option>
            <option value="leave">On Leave</option>
            <option value="absent">Absent</option>
          </select>
        </div>
        <div className="ems-grid">
          {pageItems.map((employee) => <EmployeeCard key={employee.employeeId} employee={employee} onSelectEmployee={onSelectEmployee} />)}
        </div>
        {!pageItems.length && <p className="ems-empty">No employees match your filters.</p>}
        <div className="ems-pagination">
          <button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </section>
    </main>
  );
}

function AttendanceView({ currentUser, employees, attendanceRows, attendanceStatus, checkInTime, lastDuration, onCheckIn, onCheckOut, isPeopleTeam }) {
  const [month, setMonth] = useState('2026-07');
  const [day, setDay] = useState(toInputDate(new Date('2026-07-06')));
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const departments = [...new Set(employees.map((employee) => employee.department).filter(Boolean))];

  const rows = useMemo(() => {
    const scoped = isPeopleTeam ? attendanceRows : attendanceRows.filter((row) => row.employeeId === (currentUser.employeeId || currentUser.loginId));
    return scoped
      .filter((row) => isPeopleTeam ? row.date === day : row.date.startsWith(month))
      .filter((row) => query ? `${row.name} ${row.employeeId}`.toLowerCase().includes(query.toLowerCase()) : true)
      .filter((row) => department === 'all' || row.department === department)
      .filter((row) => status === 'all' || row.status === status)
      .sort((a, b) => sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  }, [attendanceRows, currentUser.employeeId, currentUser.loginId, day, department, isPeopleTeam, month, query, sortAsc, status]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const summaryRows = isPeopleTeam ? rows : attendanceRows.filter((row) => row.employeeId === (currentUser.employeeId || currentUser.loginId) && row.date.startsWith(month));
  const summary = {
    workingDays: summaryRows.filter((row) => !['Weekend', 'Holiday'].includes(row.status)).length,
    present: summaryRows.filter((row) => ['Present', 'Late'].includes(row.status)).length,
    leave: summaryRows.filter((row) => row.status === 'Leave').length,
    workHours: summaryRows.reduce((sum, row) => sum + row.workHours, 0),
    extraHours: summaryRows.reduce((sum, row) => sum + row.extraHours, 0),
    absent: summaryRows.filter((row) => row.status === 'Absent').length,
  };

  const shiftDate = (setter, value, offset, kind) => {
    const date = new Date(value);
    if (kind === 'month') date.setMonth(date.getMonth() + offset);
    else date.setDate(date.getDate() + offset);
    setter(kind === 'month' ? toMonthValue(date) : toInputDate(date));
    setPage(1);
  };

  const exportCsv = () => {
    const headers = isPeopleTeam
      ? ['Employee Name', 'Employee ID', 'Department', 'Date', 'Check-In', 'Check-Out', 'Break Time', 'Work Hours', 'Extra Hours', 'Status']
      : ['Date', 'Check-In', 'Check-Out', 'Break Duration', 'Work Hours', 'Overtime', 'Status'];
    const csvRows = rows.map((row) => isPeopleTeam
      ? [row.name, row.employeeId, row.department, row.date, row.checkIn, row.checkOut, hoursLabel(row.breakHours), hoursLabel(row.workHours), hoursLabel(row.extraHours), row.status]
      : [row.date, row.checkIn, row.checkOut, hoursLabel(row.breakHours), hoursLabel(row.workHours), hoursLabel(row.extraHours), row.status]);
    const csv = [headers, ...csvRows].map((items) => items.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${isPeopleTeam ? day : month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="ems-page">
      <section className="ems-hero-row">
        <div>
          <p>Attendance</p>
          <h1>{isPeopleTeam ? 'Team Attendance' : 'My Attendance'}</h1>
        </div>
        <span className={(statusMeta[attendanceStatus] || statusMeta.absent).className}>{(statusMeta[attendanceStatus] || statusMeta.absent).icon} {(statusMeta[attendanceStatus] || statusMeta.absent).label}</span>
      </section>

      <section className="ems-attendance-panel">
        <div className="ems-card">
          <h2>Today</h2>
          <p>{formatDate()}</p>
          <div className="ems-attendance-actions">
            <button className="ems-primary" disabled={attendanceStatus === 'present'} onClick={onCheckIn}>Check In</button>
            <button className="ems-secondary" disabled={attendanceStatus !== 'present'} onClick={onCheckOut}>Check Out</button>
          </div>
          {checkInTime && <p className="ems-muted">Checked in at {formatTime(checkInTime)}</p>}
          {lastDuration && <strong className="ems-hours">{lastDuration}</strong>}
        </div>

        <div className="ems-card">
          <h2>{isPeopleTeam ? 'Day Snapshot' : 'Monthly Summary'}</h2>
          <div className="ems-stacked-stats">
            <StatCard label="Working Days" value={summary.workingDays} />
            <StatCard label="Days Present" value={summary.present} />
            <StatCard label="Leave Days" value={summary.leave} />
            <StatCard label="Working Hours" value={hoursLabel(summary.workHours)} />
            <StatCard label="Extra Hours" value={hoursLabel(summary.extraHours)} />
          </div>
        </div>
      </section>

      <section className="ems-card">
        <div className="ems-attendance-controls">
          {isPeopleTeam ? (
            <>
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search name or employee ID" />
              <button className="ems-secondary" onClick={() => shiftDate(setDay, day, -1, 'day')}>Previous Day</button>
              <input type="date" value={day} onChange={(event) => { setDay(event.target.value); setPage(1); }} />
              <button className="ems-secondary" onClick={() => shiftDate(setDay, day, 1, 'day')}>Next Day</button>
              <select value={department} onChange={(event) => { setDepartment(event.target.value); setPage(1); }}><option value="all">All departments</option>{departments.map((item) => <option key={item}>{item}</option>)}</select>
              <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All status</option>{attendanceStatuses.map((item) => <option key={item}>{item}</option>)}</select>
            </>
          ) : (
            <>
              <button className="ems-secondary" onClick={() => shiftDate(setMonth, `${month}-01`, -1, 'month')}>Previous Month</button>
              <input type="month" value={month} onChange={(event) => { setMonth(event.target.value); setPage(1); }} />
              <button className="ems-secondary" onClick={() => shiftDate(setMonth, `${month}-01`, 1, 'month')}>Next Month</button>
            </>
          )}
          <button className="ems-primary" onClick={exportCsv}>Export CSV</button>
          <button className="ems-secondary" onClick={exportCsv}>Excel</button>
          <button className="ems-secondary" onClick={exportCsv}>PDF</button>
        </div>
        <div className="ems-table-wrap">
          <table className="ems-table ems-sticky-table">
            <thead>
              <tr>
                {isPeopleTeam && <><th>Employee Name</th><th>Employee ID</th><th>Department</th></>}
                <th><button className="ems-sort" onClick={() => setSortAsc((value) => !value)}>Date {sortAsc ? '↑' : '↓'}</button></th>
                <th>Check-In</th><th>Check-Out</th><th>Break Time</th><th>Work Hours</th><th>Extra Hours</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id}>
                  {isPeopleTeam && <><td>{row.name}</td><td>{row.employeeId}</td><td>{row.department}</td></>}
                  <td>{row.date}</td>
                  <td>{row.checkIn}</td>
                  <td>{row.checkOut || '-'}</td>
                  <td>{hoursLabel(row.breakHours)}</td>
                  <td>{hoursLabel(row.workHours)}</td>
                  <td>{hoursLabel(row.extraHours)}</td>
                  <td><span className={attendanceStatusClass(row.status)}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!pageRows.length && <p className="ems-empty">No attendance records found for the selected filters.</p>}
        </div>
        <div className="ems-pagination">
          <button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </section>
    </main>
  );
}

function TimeOffView({ currentUser, employees = [], leaves = [], allocations = [], canApproveLeave, onAddLeave, onUpdateLeaveStatus, onCancelLeave, onSaveAllocation, onDeleteAllocation }) {
  const [activeTab, setActiveTab] = useState('Time Off');
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ query: '', employeeId: 'all', department: 'all', type: 'all', status: 'all', from: '', to: '' });
  const [form, setForm] = useState({ type: 'Paid Leave', start: '', end: '', reason: '', attachment: null });
  const [allocationForm, setAllocationForm] = useState({ employeeId: employees[0]?.employeeId || '', leaveType: 'Paid Leave', allocatedDays: 24 });
  const holidays = ['2026-01-26', '2026-08-15', '2026-10-02', '2026-12-25'];
  const departments = [...new Set(employees.map((employee) => employee.department).filter(Boolean))];
  const currentEmployeeId = currentUser.employeeId || currentUser.loginId;
  const scopedLeaves = canApproveLeave ? leaves : leaves.filter((leave) => leave.employeeId === currentEmployeeId || leave.name === currentUser.name);
  const scopedAllocations = canApproveLeave ? allocations : allocations.filter((item) => item.employeeId === currentEmployeeId);

  const workingDaysBetween = (start, end) => {
    if (!start || !end || new Date(end) < new Date(start)) return 0;
    let days = 0;
    for (let date = new Date(start); date <= new Date(end); date.setDate(date.getDate() + 1)) {
      const key = toInputDate(date);
      if (![0, 6].includes(date.getDay()) && !holidays.includes(key)) days += 1;
    }
    return days;
  };

  const requestedDays = workingDaysBetween(form.start, form.end);
  const balanceFor = (leaveType, employeeId = currentEmployeeId) => {
    if (leaveType === 'Unpaid Leave') return Infinity;
    const allocation = allocations.find((item) => item.employeeId === employeeId && item.leaveType === leaveType);
    return allocation?.remainingDays ?? (leaveType === 'Paid Leave' ? 24 : 7);
  };

  const filteredLeaves = scopedLeaves.filter((leave) => {
    const queryMatch = filters.query ? `${leave.name} ${leave.employeeId}`.toLowerCase().includes(filters.query.toLowerCase()) : true;
    const employeeMatch = filters.employeeId === 'all' || leave.employeeId === filters.employeeId;
    const departmentMatch = filters.department === 'all' || leave.department === filters.department;
    const typeMatch = filters.type === 'all' || leave.type === filters.type;
    const statusMatch = filters.status === 'all' || leave.status === filters.status;
    const fromMatch = !filters.from || leave.start >= filters.from;
    const toMatch = !filters.to || leave.end <= filters.to;
    return queryMatch && employeeMatch && departmentMatch && typeMatch && statusMatch && fromMatch && toMatch;
  });
  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / PAGE_SIZE));
  const pageRows = filteredLeaves.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submitLeave = (event) => {
    event.preventDefault();
    if (!form.start || !form.end || new Date(form.end) < new Date(form.start)) return;
    if (requestedDays <= 0) return;
    const overlaps = scopedLeaves.some((leave) => ['Pending', 'Approved'].includes(leave.status) && form.start <= leave.end && form.end >= leave.start);
    if (overlaps) return window.alert('This request overlaps with an existing pending or approved leave.');
    if (form.type !== 'Unpaid Leave' && requestedDays > balanceFor(form.type)) return window.alert('Requested days exceed the available balance.');
    const employee = employees.find((item) => item.employeeId === currentEmployeeId) || {};
    onAddLeave({
      id: Date.now(),
      employeeId: currentEmployeeId,
      name: currentUser.name,
      department: employee.department || 'General',
      type: form.type,
      start: form.start,
      end: form.end,
      days: requestedDays,
      reason: form.reason,
      attachmentName: form.attachment?.name || '',
      status: 'Pending',
      appliedDate: toInputDate(new Date()),
      remarks: 'Awaiting approval',
    });
    setForm({ type: 'Paid Leave', start: '', end: '', reason: '', attachment: null });
    setModalOpen(false);
  };

  const exportLeaves = () => {
    const headers = ['Employee', 'Employee ID', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Requested Days', 'Status', 'Applied Date'];
    const csv = [headers, ...filteredLeaves.map((leave) => [leave.name, leave.employeeId, leave.department, leave.type, leave.start, leave.end, leave.days, leave.status, leave.appliedDate])]
      .map((row) => row.map((item) => `"${String(item || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leave-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const calendarMonths = Array.from({ length: 12 }, (_, month) => ({ month, label: new Date(2026, month, 1).toLocaleString('en', { month: 'short' }) }));
  const statusForDay = (key) => {
    if (holidays.includes(key)) return 'Holiday';
    const date = new Date(key);
    if ([0, 6].includes(date.getDay())) return 'Weekend';
    const leave = scopedLeaves.find((item) => item.start <= key && item.end >= key);
    return leave?.status || '';
  };

  return (
    <main className="ems-page">
      <section className="ems-hero-row">
        <div><p>Leave Management</p><h1>Time Off</h1></div>
        <button className="ems-primary" onClick={() => setModalOpen(true)}>New Request</button>
      </section>

      <div className="ems-tabs">
        <button className={activeTab === 'Time Off' ? 'active' : ''} onClick={() => setActiveTab('Time Off')}>Time Off</button>
        {canApproveLeave && <button className={activeTab === 'Leave Allocation' ? 'active' : ''} onClick={() => setActiveTab('Leave Allocation')}>Leave Allocation</button>}
      </div>

      {activeTab === 'Time Off' && (
        <>
          <section className="ems-stats-grid">
            <StatCard label="Paid Leave Available" value={`${balanceFor('Paid Leave') === Infinity ? 'Unlimited' : balanceFor('Paid Leave')} Days`} />
            <StatCard label="Sick Leave Available" value={`${balanceFor('Sick Leave') === Infinity ? 'Unlimited' : balanceFor('Sick Leave')} Days`} />
            <StatCard label="Unpaid Leave" value="Policy Based" />
            <StatCard label="Pending Requests" value={scopedLeaves.filter((leave) => leave.status === 'Pending').length} />
          </section>

          <section className="ems-leave-layout">
            <div className="ems-card">
              <div className="ems-calendar-head"><h2>2026 Leave Calendar</h2><div className="ems-legend"><span className="approved">Approved</span><span className="pending">Pending</span><span className="rejected">Rejected</span><span className="holiday">Holiday</span><span className="weekend">Weekend</span></div></div>
              <div className="ems-year-calendar">
                {calendarMonths.map(({ month, label }) => (
                  <div key={label} className="ems-month-card">
                    <strong>{label}</strong>
                    <div className="ems-mini-days">
                      {Array.from({ length: 31 }, (_, index) => {
                        const date = new Date(2026, month, index + 1);
                        if (date.getMonth() !== month) return <span key={index} />;
                        const key = toInputDate(date);
                        const dayStatus = statusForDay(key);
                        return <span key={key} className={String(dayStatus).toLowerCase()} title={dayStatus || key}>{index + 1}</span>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <aside className="ems-card">
              <h2>Company Holidays</h2>
              {holidays.map((holiday) => <p key={holiday} className="ems-holiday-row">{holiday}</p>)}
              <h2>Policy</h2>
              <p className="ems-muted">Weekends and company holidays are excluded from leave duration. Sick leave may require an attachment.</p>
            </aside>
          </section>

          <section className="ems-card">
            {canApproveLeave && (
              <div className="ems-attendance-controls">
                <input placeholder="Search employee or ID" value={filters.query} onChange={(event) => { setFilters({ ...filters, query: event.target.value }); setPage(1); }} />
                <select value={filters.department} onChange={(event) => { setFilters({ ...filters, department: event.target.value }); setPage(1); }}><option value="all">All departments</option>{departments.map((item) => <option key={item}>{item}</option>)}</select>
                <select value={filters.type} onChange={(event) => { setFilters({ ...filters, type: event.target.value }); setPage(1); }}><option value="all">All leave types</option><option>Paid Leave</option><option>Sick Leave</option><option>Unpaid Leave</option></select>
                <select value={filters.status} onChange={(event) => { setFilters({ ...filters, status: event.target.value }); setPage(1); }}><option value="all">All status</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Cancelled</option></select>
                <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
                <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
                <button className="ems-primary" onClick={exportLeaves}>Export CSV</button>
                <button className="ems-secondary" onClick={exportLeaves}>PDF</button>
              </div>
            )}
            <div className="ems-table-wrap">
              <table className="ems-table ems-sticky-table">
                <thead><tr>{canApproveLeave && <><th>Employee</th><th>Employee ID</th><th>Department</th></>}<th>Leave Type</th><th>Start Date</th><th>End Date</th><th>Requested Days</th><th>Remaining Balance</th><th>Status</th><th>Applied Date</th><th>Remarks</th><th>Actions</th></tr></thead>
                <tbody>
                  {pageRows.map((leave) => (
                    <tr key={leave.id}>
                      {canApproveLeave && <><td>{leave.name}</td><td>{leave.employeeId}</td><td>{leave.department}</td></>}
                      <td>{leave.type}</td><td>{leave.start}</td><td>{leave.end}</td><td>{leave.days}</td><td>{leave.type === 'Unpaid Leave' ? 'Unlimited' : balanceFor(leave.type, leave.employeeId)}</td><td><span className={`ems-leave-badge ${leave.status.toLowerCase()}`}>{leave.status}</span></td><td>{leave.appliedDate}</td><td>{leave.remarks}</td>
                      <td>{leave.status === 'Pending' ? (canApproveLeave ? <div className="ems-row-actions"><button onClick={() => onUpdateLeaveStatus(leave.id, 'Approved')}>Approve</button><button onClick={() => onUpdateLeaveStatus(leave.id, 'Rejected')}>Reject</button></div> : <button className="ems-secondary" onClick={() => onCancelLeave(leave.id)}>Cancel</button>) : 'View'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!pageRows.length && <p className="ems-empty">No leave records found.</p>}
            </div>
            <div className="ems-pagination"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></div>
          </section>
        </>
      )}

      {activeTab === 'Leave Allocation' && canApproveLeave && (
        <section className="ems-card">
          <form className="ems-form-grid" onSubmit={(event) => { event.preventDefault(); onSaveAllocation(allocationForm); }}>
            <label>Employee<select value={allocationForm.employeeId} onChange={(event) => setAllocationForm({ ...allocationForm, employeeId: event.target.value })}>{employees.map((employee) => <option key={employee.employeeId} value={employee.employeeId}>{employee.name}</option>)}</select></label>
            <label>Leave Type<select value={allocationForm.leaveType} onChange={(event) => setAllocationForm({ ...allocationForm, leaveType: event.target.value })}><option>Paid Leave</option><option>Sick Leave</option><option>Unpaid Leave</option><option>Casual Leave</option></select></label>
            <label>Allocated Days<input type="number" value={allocationForm.allocatedDays} onChange={(event) => setAllocationForm({ ...allocationForm, allocatedDays: event.target.value })} /></label>
            <button className="ems-primary">Save Allocation</button>
          </form>
          <div className="ems-table-wrap">
            <table className="ems-table"><thead><tr><th>Employee</th><th>Leave Type</th><th>Allocated Days</th><th>Used Days</th><th>Remaining Days</th><th>Actions</th></tr></thead><tbody>{scopedAllocations.map((allocation) => <tr key={`${allocation.employeeId}-${allocation.leaveType}`}><td>{allocation.name}</td><td>{allocation.leaveType}</td><td>{allocation.allocatedDays}</td><td>{allocation.usedDays}</td><td>{allocation.remainingDays}</td><td><div className="ems-row-actions"><button className="ems-secondary" onClick={() => setAllocationForm({ employeeId: allocation.employeeId, leaveType: allocation.leaveType, allocatedDays: allocation.allocatedDays })}>Edit</button><button className="ems-danger" type="button" onClick={() => onDeleteAllocation(allocation.employeeId, allocation.leaveType)}>Delete</button></div></td></tr>)}</tbody></table>
          </div>
        </section>
      )}

      {modalOpen && (
        <div className="ems-modal-backdrop">
          <form className="ems-modal" onSubmit={submitLeave}>
            <div className="ems-modal-head"><h2>New Leave Request</h2><button type="button" onClick={() => setModalOpen(false)}>x</button></div>
            <div className="ems-form-grid">
              <label>Employee Name<input value={currentUser.name || 'Employee'} disabled /></label>
              <label>Leave Type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>Paid Leave</option><option>Sick Leave</option><option>Unpaid Leave</option></select></label>
              <label>Start Date<input type="date" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} required /></label>
              <label>End Date<input type="date" value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} required /></label>
              <label>Total Leave Days<input value={requestedDays} disabled /></label>
              <label>Attachment<input type="file" onChange={(event) => setForm({ ...form, attachment: event.target.files?.[0] || null })} /></label>
              <label className="ems-full-field">Reason for Leave<input value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} required /></label>
            </div>
            <div className="ems-modal-actions"><button type="button" className="ems-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="ems-primary">Submit</button></div>
          </form>
        </div>
      )}
    </main>
  );
}

function NewEmployeeModal({ onClose, onCreate, saving, credentials, error }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', mobile: '', jobPosition: '', department: '', role: 'Employee' });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="ems-modal-backdrop">
      <form className="ems-modal" onSubmit={(event) => { event.preventDefault(); onCreate(form); }}>
        <div className="ems-modal-head"><h2>Create Employee</h2><button type="button" onClick={onClose}>×</button></div>
        <div className="ems-form-grid">
          <label>First Name<input value={form.firstName} onChange={(event) => update('firstName', event.target.value)} required /></label>
          <label>Last Name<input value={form.lastName} onChange={(event) => update('lastName', event.target.value)} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required /></label>
          <label>Mobile<input value={form.mobile} onChange={(event) => update('mobile', event.target.value.replace(/[^\d+]/g, ''))} required /></label>
          <label>Job Title<input value={form.jobPosition} onChange={(event) => update('jobPosition', event.target.value)} /></label>
          <label>Department<input value={form.department} onChange={(event) => update('department', event.target.value)} /></label>
          <label>Role<select value={form.role} onChange={(event) => update('role', event.target.value)}><option>Employee</option><option>HR</option><option>Admin</option></select></label>
        </div>
        {error && <div className="ems-toast error">{error}</div>}
        {credentials && <div className="ems-toast success">Login ID: {credentials.loginId}<br />Temporary Password: {credentials.temporaryPassword}</div>}
        <div className="ems-modal-actions">
          <button type="button" className="ems-secondary" onClick={onClose}>Cancel</button>
          <button className="ems-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Employee'}</button>
        </div>
      </form>
    </div>
  );
}

export default function Dashboard({ currentUser = {}, onSelectEmployee, onOpenProfile, onLogout }) {
  const [activeModule, setActiveModule] = useState('Employees');
  const [employees, setEmployees] = useState(seedEmployees);
  const [attendanceRows, setAttendanceRows] = useState(() => makeAttendanceRows(seedEmployees));
  const [leaves, setLeaves] = useState([
    { id: 1, employeeId: 'OISRSX20260002', name: 'Sreejith S', department: 'People', type: 'Sick Leave', start: '2026-07-08', end: '2026-07-09', days: 2, status: 'Pending', appliedDate: '2026-07-06', remarks: 'Awaiting approval' },
    { id: 2, employeeId: 'OIPRNA20260007', name: 'Priya Nair', department: 'People', type: 'Paid Leave', start: '2026-07-13', end: '2026-07-14', days: 2, status: 'Approved', appliedDate: '2026-07-05', remarks: 'Approved by HR' },
  ]);
  const [allocations, setAllocations] = useState(() => seedEmployees.flatMap((employee) => [
    { employeeId: employee.employeeId, name: employee.name, leaveType: 'Paid Leave', allocatedDays: 24, usedDays: 0, remainingDays: 24 },
    { employeeId: employee.employeeId, name: employee.name, leaveType: 'Sick Leave', allocatedDays: 7, usedDays: 0, remainingDays: 7 },
  ]));
  const [attendanceStatus, setAttendanceStatus] = useState('absent');
  const [checkInTime, setCheckInTime] = useState(null);
  const [lastDuration, setLastDuration] = useState('');
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false);
  const [employeeCreateState, setEmployeeCreateState] = useState({ saving: false, error: '', credentials: null });
  const [toast, setToast] = useState(null);

  const role = currentUser.role || 'Employee';
  const canManageEmployees = role === 'Admin' || role === 'HR';
  const canApproveLeave = role === 'Admin' || role === 'HR';
  const currentEmployeeId = currentUser.employeeId || currentUser.loginId || 'EMP-001';

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return;
    const loadLeaveData = async () => {
      try {
        const [leaveResponse, allocationResponse] = await Promise.all([
          fetch(`${API_URL}/api/leaves`, { headers: authHeaders() }),
          fetch(`${API_URL}/api/leaves/allocations/list`, { headers: authHeaders() }),
        ]);
        if (leaveResponse.ok) {
          const data = await leaveResponse.json();
          setLeaves((data.leaves || []).map(toUiLeave));
        }
        if (allocationResponse.ok) {
          const data = await allocationResponse.json();
          setAllocations((data.allocations || []).map(toUiAllocation));
        }
      } catch {
        setToast({ type: 'error', message: 'Backend unavailable. Showing local demo data.' });
      }
    };
    loadLeaveData();
  }, []);

  const visibleEmployees = useMemo(() => {
    if (canManageEmployees) return employees;
    const ownEmployee = employees.find((employee) => employee.employeeId === currentEmployeeId);
    return ownEmployee ? [{ ...ownEmployee, status: attendanceStatus }] : [{
      id: 'current-user',
      name: currentUser.name || 'My Profile',
      employeeId: currentEmployeeId,
      jobPosition: 'Employee',
      department: 'General',
      email: currentUser.email || 'employee@company.com',
      mobile: currentUser.phone || '+91 00000 00000',
      company: 'Odoo India',
      manager: 'Manager',
      location: 'Office',
      status: attendanceStatus,
    }];
  }, [attendanceStatus, canManageEmployees, currentEmployeeId, currentUser.email, currentUser.name, currentUser.phone, employees]);

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now);
    setAttendanceStatus('present');
    setEmployees((items) => items.map((item) => item.employeeId === currentEmployeeId ? { ...item, status: 'present' } : item));
    setToast({ type: 'success', message: 'Checked in successfully.' });
  };

  const handleCheckOut = () => {
    if (!checkInTime) return;
    const now = new Date();
    const minutes = Math.max(1, Math.round((now - checkInTime) / 60000));
    const workHours = Number((minutes / 60).toFixed(2));
    const extraHours = Math.max(0, Number((workHours - 8).toFixed(2)));
    setAttendanceStatus('absent');
    setLastDuration(`${hoursLabel(workHours)} total hours worked today`);
    setAttendanceRows((rows) => [{
      id: Date.now(),
      name: currentUser.name || 'Me',
      employeeId: currentEmployeeId,
      department: 'General',
      date: toInputDate(now),
      shift: 'Fixed Shift',
      checkIn: formatTime(checkInTime),
      checkOut: formatTime(now),
      breakHours: 0,
      workHours,
      extraHours,
      status: workHours < 4 ? 'Half Day' : 'Present',
      leaveType: '',
      remarks: 'Self check-out',
    }, ...rows]);
    setEmployees((items) => items.map((item) => item.employeeId === currentEmployeeId ? { ...item, status: 'absent' } : item));
    setToast({ type: 'success', message: `Checked out. Total hours: ${hoursLabel(workHours)}` });
  };

  const handleUpdateLeaveStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/api/leaves/${id}/review`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const data = await response.json();
        setLeaves((items) => items.map((leave) => leave.id === id ? toUiLeave(data.leave) : leave));
      }
    } catch {
      // Local fallback keeps the demo workflow usable when the API is not running.
    }
    setLeaves((items) => items.map((leave) => {
      if (leave.id !== id) return leave;
      return { ...leave, status, remarks: status === 'Approved' ? 'Approved by People team' : 'Rejected by People team' };
    }));
    if (status === 'Approved') {
      const leave = leaves.find((item) => item.id === id);
      if (leave?.type !== 'Unpaid Leave') {
        setAllocations((items) => items.map((allocation) => (
          allocation.employeeId === leave.employeeId && allocation.leaveType === leave.type
            ? { ...allocation, usedDays: allocation.usedDays + leave.days, remainingDays: Math.max(0, allocation.remainingDays - leave.days) }
            : allocation
        )));
      }
      if (leave) {
        setAttendanceRows((rows) => [{
          id: `leave-${leave.id}`,
          name: leave.name,
          employeeId: leave.employeeId,
          department: leave.department,
          date: leave.start,
          shift: 'Fixed Shift',
          checkIn: '-',
          checkOut: '-',
          breakHours: 0,
          workHours: 0,
          extraHours: 0,
          status: 'Leave',
          leaveType: leave.type,
          remarks: 'Synced from approved leave',
        }, ...rows]);
      }
    }
    setToast({ type: 'success', message: `Leave ${status.toLowerCase()}.` });
  };

  const handleCancelLeave = async (id) => {
    try {
      await fetch(`${API_URL}/api/leaves/${id}/cancel`, { method: 'PATCH', headers: authHeaders() });
    } catch {
      // Local fallback keeps the employee flow responsive during frontend-only runs.
    }
    setLeaves((items) => items.map((leave) => leave.id === id ? { ...leave, status: 'Cancelled', remarks: 'Cancelled by employee' } : leave));
    setToast({ type: 'success', message: 'Leave request cancelled.' });
  };

  const handleSaveAllocation = async (allocationForm) => {
    const employee = employees.find((item) => item.employeeId === allocationForm.employeeId);
    if (!employee) return;
    try {
      const response = await fetch(`${API_URL}/api/leaves/allocations`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId: employee.id, leaveType: allocationForm.leaveType, allocatedDays: allocationForm.allocatedDays }),
      });
      if (response.ok) {
        const data = await response.json();
        setAllocations((items) => [toUiAllocation(data.allocation), ...items.filter((item) => item.employeeId !== employee.employeeId || item.leaveType !== allocationForm.leaveType)]);
        setToast({ type: 'success', message: 'Leave allocation saved.' });
        return;
      }
    } catch {
      // Fall through to local state when employee records are demo-only.
    }
    setAllocations((items) => {
      const existing = items.find((item) => item.employeeId === allocationForm.employeeId && item.leaveType === allocationForm.leaveType);
      const allocatedDays = Number(allocationForm.allocatedDays);
      if (existing) {
        return items.map((item) => item === existing ? { ...item, allocatedDays, remainingDays: Math.max(0, allocatedDays - item.usedDays) } : item);
      }
      return [{ employeeId: employee.employeeId, name: employee.name, leaveType: allocationForm.leaveType, allocatedDays, usedDays: 0, remainingDays: allocatedDays }, ...items];
    });
    setToast({ type: 'success', message: 'Leave allocation saved.' });
  };

  const handleAddLeave = async (leave) => {
    try {
      const response = await fetch(`${API_URL}/api/leaves`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ leaveType: leave.type, startDate: leave.start, endDate: leave.end, reason: leave.reason }),
      });
      if (response.ok) {
        const data = await response.json();
        setLeaves((items) => [toUiLeave(data.leave), ...items]);
        setToast({ type: 'success', message: 'Leave request submitted.' });
        return;
      }
    } catch {
      // Fall back to local state if the backend is offline.
    }
    setLeaves((items) => [leave, ...items]);
    setToast({ type: 'success', message: 'Leave request submitted.' });
  };

  const handleCreateEmployee = async (form) => {
    setEmployeeCreateState({ saving: true, error: '', credentials: null });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/create-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.mobile, role: form.role, department: form.department, jobPosition: form.jobPosition }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Unable to create employee');
      const created = {
        id: data.employee?.id || Date.now(),
        name: `${form.firstName} ${form.lastName}`.trim(),
        employeeId: data.loginId,
        jobPosition: form.jobPosition || form.role,
        department: form.department || 'General',
        email: form.email,
        mobile: form.mobile,
        company: 'Odoo India',
        manager: currentUser.name || 'Admin',
        location: 'Office',
        status: 'absent',
      };
      setEmployees((items) => [created, ...items]);
      setEmployeeCreateState({ saving: false, error: '', credentials: { loginId: data.loginId, temporaryPassword: data.temporaryPassword } });
      setToast({ type: 'success', message: 'Employee created and credentials generated.' });
    } catch (error) {
      setEmployeeCreateState({ saving: false, error: error.message, credentials: null });
    }
  };

  return (
    <div className="ems-shell">
      <ShellNav activeModule={activeModule} onModuleChange={setActiveModule} currentUser={currentUser} onOpenProfile={onOpenProfile} onLogout={onLogout} />
      {activeModule === 'Employees' && <EmployeesView employees={visibleEmployees} canManageEmployees={canManageEmployees} onSelectEmployee={onSelectEmployee} onNewEmployee={() => { setNewEmployeeOpen(true); setEmployeeCreateState({ saving: false, error: '', credentials: null }); }} toast={toast} />}
      {activeModule === 'Attendance' && <AttendanceView currentUser={currentUser} employees={visibleEmployees} attendanceRows={attendanceRows} attendanceStatus={attendanceStatus} checkInTime={checkInTime} lastDuration={lastDuration} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} isPeopleTeam={canManageEmployees} />}
      {activeModule === 'Time Off' && <TimeOffView currentUser={currentUser} employees={visibleEmployees} leaves={leaves} allocations={allocations} canApproveLeave={canApproveLeave} onAddLeave={handleAddLeave} onUpdateLeaveStatus={handleUpdateLeaveStatus} onCancelLeave={handleCancelLeave} onSaveAllocation={handleSaveAllocation} onDeleteAllocation={(employeeId, leaveType) => setAllocations((items) => items.filter((item) => item.employeeId !== employeeId || item.leaveType !== leaveType))} />}
      {newEmployeeOpen && <NewEmployeeModal onClose={() => setNewEmployeeOpen(false)} onCreate={handleCreateEmployee} saving={employeeCreateState.saving} credentials={employeeCreateState.credentials} error={employeeCreateState.error} />}
    </div>
  );
}
