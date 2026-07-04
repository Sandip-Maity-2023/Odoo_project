import React, { useMemo, useState } from 'react';
import logo from './assets/odoo_img.png';

const INITIAL_EMPLOYEES = [
  { id: 1, name: 'Shibashis Das', employeeId: 'OISHDA20260001', jobPosition: 'Frontend Developer', email: 'shibashis@company.com', mobile: '+91 98765 43210', status: 'present', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Shibashis%20Das' },
  { id: 2, name: 'Sreejith S', employeeId: 'OISRSX20260002', jobPosition: 'HR Executive', email: 'sreejith@company.com', mobile: '+91 98765 43211', status: 'leave', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Sreejith%20S' },
  { id: 3, name: 'Rohit Kumar', employeeId: 'OIROKU20260003', jobPosition: 'Backend Developer', email: 'rohit@company.com', mobile: '+91 98765 43212', status: 'absent', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Rohit%20Kumar' },
  { id: 4, name: 'Ananya Sen', employeeId: 'OIANSE20260004', jobPosition: 'Payroll Analyst', email: 'ananya@company.com', mobile: '+91 98765 43213', status: 'present', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Ananya%20Sen' },
];

const INITIAL_ATTENDANCE = [
  { id: 1, name: 'Shibashis Das', date: '28/10/2025', checkIn: '10:00', checkOut: '19:00', hours: '09:00', extra: '01:00' },
  { id: 2, name: 'Sreejith S', date: '29/10/2025', checkIn: '10:00', checkOut: '19:00', hours: '09:00', extra: '01:00' },
  { id: 3, name: 'Rohit Kumar', date: '30/10/2025', checkIn: '10:15', checkOut: '18:45', hours: '08:30', extra: '00:30' },
];

const INITIAL_LEAVES = [
  { id: 1, name: 'Shibashis Das', start: '28/10/2025', end: '28/10/2025', type: 'Paid time off', status: 'Pending' },
  { id: 2, name: 'Sreejith S', start: '13/05/2026', end: '14/05/2026', type: 'Sick time off', status: 'Pending' },
];

const salaryRows = [
  ['Month Wage', 'Rs 50,000'],
  ['Yearly Wage', 'Rs 6,00,000'],
  ['Basic Salary (50%)', 'Rs 25,000'],
  ['HRA (50% of Basic)', 'Rs 12,500'],
  ['Standard Allowance (16.67%)', 'Rs 4,167'],
  ['Performance Bonus (8.33%)', 'Rs 2,092.50'],
  ['Leave Travel Allowance (8.33%)', 'Rs 2,092.50'],
  ['Fixed Allowance (11.67%)', 'Rs 2,918'],
  ['PF Employee (12%)', 'Rs 3,000'],
  ['PF Employer (12%)', 'Rs 3,000'],
  ['Professional Tax', 'Rs 200 / month'],
];

const STATUS_META = {
  present: { label: 'Present', mark: '●', className: 'text-green-600' },
  leave: { label: 'On leave', mark: '✈', className: 'text-blue-600' },
  absent: { label: 'Absent', mark: '●', className: 'text-yellow-500' },
};

const formatDate = (value) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

const makeEmployeeId = (firstName, lastName, serial) => {
  const first = (firstName || 'NA').replace(/[^a-z0-9]/gi, '').slice(0, 2).padEnd(2, 'X').toUpperCase();
  const last = (lastName || 'XX').replace(/[^a-z0-9]/gi, '').slice(0, 2).padEnd(2, 'X').toUpperCase();
  return `OI${first}${last}2026${String(serial).padStart(4, '0')}`;
};

function ModuleButton({ module, activeModule, onChange }) {
  return (
    <button
      onClick={() => onChange(module)}
      className={`border-b-2 px-3 py-2 text-sm font-semibold ${activeModule === module ? 'border-sky-500 bg-sky-100 text-gray-900' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
    >
      {module}
    </button>
  );
}

function EmployeeCard({ employee, onSelectEmployee }) {
  const status = STATUS_META[employee.status] || STATUS_META.absent;

  return (
    <button onClick={() => onSelectEmployee(employee)} className="relative rounded border border-gray-300 bg-white p-4 text-left shadow-sm transition hover:border-sky-400 hover:shadow-md">
      <span className={`absolute right-3 top-3 text-xl leading-none ${status.className}`} title={status.label}>{status.mark}</span>
      <img src={employee.avatar} alt={employee.name} className="mb-4 h-16 w-16 rounded-full border border-gray-200 bg-gray-50" />
      <h3 className="pr-7 text-sm font-semibold text-gray-900">{employee.name}</h3>
      <p className="mt-1 text-xs text-gray-500">{employee.jobPosition}</p>
      <p className="mt-3 text-xs font-medium text-sky-700">{employee.employeeId}</p>
    </button>
  );
}

function AdminPanel({ currentUser, activeModule, onModuleChange }) {
  const [activeTab, setActiveTab] = useState('Resume');

  return (
    <aside className="border-r border-gray-300 bg-white p-4 lg:w-80">
      <img src={logo} alt="Company Logo" className="mb-5 h-9 object-contain" />
      <nav className="mb-6 grid gap-1">
        {['Employees', 'Attendance', 'Time Off'].map((module) => (
          <button key={module} onClick={() => onModuleChange(module)} className={`rounded px-3 py-2 text-left text-sm font-semibold ${activeModule === module ? 'bg-sky-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>
            {module}
          </button>
        ))}
      </nav>

      <section className="border-t border-gray-200 pt-4">
        <h2 className="text-sm font-bold text-gray-900">My Profile</h2>
        <dl className="mt-3 grid gap-2 text-xs text-gray-600">
          <div><dt className="font-semibold text-gray-500">Name</dt><dd>{currentUser.name || 'Admin User'}</dd></div>
          <div><dt className="font-semibold text-gray-500">Login ID</dt><dd>{currentUser.employeeId || 'ADMIN-001'}</dd></div>
          <div><dt className="font-semibold text-gray-500">Email</dt><dd>{currentUser.email || 'admin@company.com'}</dd></div>
          <div><dt className="font-semibold text-gray-500">Mobile</dt><dd>+91 98765 43210</dd></div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          {['Resume', 'Private Info', 'Salary Info'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded border px-3 py-1 text-xs font-semibold ${activeTab === tab ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Resume' && (
          <div className="mt-4 grid gap-3">
            {['About', 'What I love about my job', 'Interests', 'Skills', 'Certification'].map((field) => (
              <label key={field} className="grid gap-1 text-xs font-semibold text-gray-600">
                {field}
                <textarea className="min-h-16 resize-none rounded border border-gray-200 p-2 font-normal outline-none focus:border-sky-400" />
              </label>
            ))}
          </div>
        )}
        {activeTab === 'Private Info' && <div className="mt-4 grid gap-2 text-xs text-gray-600"><p>Working days/week: 5</p><p>Break time: 1 hour</p><p>Department: Human Resources</p></div>}
        {activeTab === 'Salary Info' && (
          <div className="mt-4 overflow-hidden rounded border border-gray-200">
            {salaryRows.map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-gray-100 px-3 py-2 text-xs last:border-b-0"><span className="text-gray-500">{label}</span><span className="font-semibold text-gray-900">{value}</span></div>)}
          </div>
        )}
      </section>
    </aside>
  );
}

function TopBar({ activeModule, onModuleChange, currentUser, onOpenProfile, onLogout, attendanceStatus, onCheckIn, onCheckOut, lastDuration }) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="flex items-center justify-between border-b border-gray-300 bg-white px-4 py-0 shadow-sm">
      <div className="flex items-center gap-5">
        <img src={logo} alt="Company Logo" className="h-8 object-contain" />
        <nav className="hidden md:flex">
          {['Employees', 'Attendance', 'Time Off'].map((module) => <ModuleButton key={module} module={module} activeModule={activeModule} onChange={onModuleChange} />)}
        </nav>
      </div>

      <div className="flex items-center gap-3 py-2">
        <div className="rounded border border-gray-200 bg-gray-50 px-3 py-1 text-xs">
          {attendanceStatus === 'present' ? (
            <div className="flex items-center gap-2"><span className="text-green-700">● Present</span><button onClick={onCheckOut} className="rounded bg-red-100 px-2 py-1 font-semibold text-red-700">Check OUT</button></div>
          ) : (
            <div className="flex items-center gap-2"><span className="text-yellow-600">● Absent</span><button onClick={onCheckIn} className="rounded bg-green-100 px-2 py-1 font-semibold text-green-700">Check IN</button></div>
          )}
          {lastDuration && <p className="mt-1 text-gray-500">{lastDuration}</p>}
        </div>

        <div className="relative">
          <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="h-10 w-10 overflow-hidden rounded-full border border-gray-300 bg-red-500">
            <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(currentUser.name || 'User')}`} alt="Avatar" />
          </button>
          {profileDropdownOpen && (
            <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded border border-gray-200 bg-white shadow-lg">
              <button onClick={() => onOpenProfile()} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">My Profile</button>
              <button onClick={onLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Log Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function EmployeesView({ isAdmin, employees, onSelectEmployee, onNewEmployee }) {
  const [search, setSearch] = useState('');
  const filteredEmployees = employees.filter((employee) => `${employee.name} ${employee.employeeId} ${employee.jobPosition}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="p-5">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><h1 className="text-xl font-bold text-gray-900">Employee Dashboard</h1><p className="text-sm text-gray-500">Profile cards open view-only employee information.</p></div>
        <div className="flex gap-2">
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Search employees" />
          {isAdmin && <button onClick={onNewEmployee} className="rounded bg-fuchsia-400 px-4 py-2 text-sm font-bold text-white hover:bg-fuchsia-500">New Employee</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {filteredEmployees.map((employee) => <EmployeeCard key={employee.id} employee={employee} onSelectEmployee={onSelectEmployee} />)}
      </div>
    </main>
  );
}

function AttendanceView({ isAdmin, currentUser, attendanceRows }) {
  const [search, setSearch] = useState('');
  const [periodIndex, setPeriodIndex] = useState(0);
  const [groupBy, setGroupBy] = useState(isAdmin ? 'Date' : 'Oct');
  const periods = ['22, October 2025', '23, October 2025', '24, October 2025'];
  const baseRows = isAdmin ? attendanceRows : attendanceRows.filter((row) => row.name === (currentUser.name || ''));
  const fallbackRows = [{ id: 'me', name: currentUser.name || 'Me', date: '28/10/2025', checkIn: '10:00', checkOut: '19:00', hours: '09:00', extra: '01:00' }];
  const visibleRows = (baseRows.length ? baseRows : fallbackRows).filter((row) => `${row.name} ${row.date} ${row.checkIn} ${row.checkOut}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="p-5">
      <section className="overflow-hidden border border-gray-400 bg-white">
        <div className="flex items-center gap-4 border-b border-gray-400 px-4 py-2">
          <h1 className="font-semibold">Attendance</h1>
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-72 rounded border border-gray-400 px-3 py-1 text-sm" placeholder="Searchbar" />
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-400 px-3 py-2">
          <button onClick={() => setPeriodIndex((value) => Math.max(0, value - 1))} className="border border-gray-400 px-3 py-1 text-xl">&lt;-</button>
          <button onClick={() => setPeriodIndex((value) => Math.min(periods.length - 1, value + 1))} className="border border-gray-400 px-3 py-1 text-xl">-&gt;</button>
          <button onClick={() => setGroupBy(groupBy === 'Date' ? 'Month' : 'Date')} className="border border-gray-400 px-4 py-2">{groupBy} v</button>
          {!isAdmin && <button className="border border-gray-400 px-4 py-2">Present: {visibleRows.length}</button>}
          {!isAdmin && <button className="border border-gray-400 px-4 py-2">Leaves: 1</button>}
          {!isAdmin && <button className="border border-gray-400 px-4 py-2">Working days: 22</button>}
          {isAdmin && <button onClick={() => setGroupBy(groupBy === 'Day' ? 'Date' : 'Day')} className="border border-gray-400 px-4 py-2">Day</button>}
        </div>
        <div className="px-4 py-4 text-sm font-semibold">{periods[periodIndex]}</div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-gray-400 text-sm">
            <thead><tr className="text-left"><th className="border-r border-gray-400 px-3 py-2">{isAdmin ? 'Emp' : 'Date'}</th><th className="border-r border-gray-400 px-3 py-2">Check In</th><th className="border-r border-gray-400 px-3 py-2">Check Out</th><th className="border-r border-gray-400 px-3 py-2">Work Hours</th><th className="px-3 py-2">Extra hours</th></tr></thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="border-t border-gray-300">
                  <td className="border-r border-gray-400 px-3 py-3">{isAdmin ? row.name : row.date}</td>
                  <td className="border-r border-gray-400 px-3 py-3">{row.checkIn}</td>
                  <td className="border-r border-gray-400 px-3 py-3">{row.checkOut}</td>
                  <td className="border-r border-gray-400 px-3 py-3">{row.hours}</td>
                  <td className="px-3 py-3">{row.extra}</td>
                </tr>
              ))}
              {!visibleRows.length && <tr><td colSpan="5" className="px-3 py-6 text-center text-gray-500">No attendance records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function CalendarGrid({ leaves }) {
  const months = ['January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026', 'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026'];
  const requestedDays = new Set(leaves.flatMap((leave) => [leave.start?.slice(0, 2), leave.end?.slice(0, 2)]).filter(Boolean));

  return (
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
      {months.map((month, monthIndex) => (
        <div key={month} className="rounded border border-gray-200 p-2">
          <h3 className="mb-2 text-xs font-semibold">{month}</h3>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-500">
            {Array.from({ length: 35 }, (_, index) => {
              const day = index - 2;
              const marked = (monthIndex === 4 && requestedDays.has(String(day).padStart(2, '0'))) || (monthIndex === 6 && day === 9);
              return <span key={index} className={`rounded py-0.5 ${marked ? 'bg-red-500 text-white' : day > 0 && day < 31 ? 'bg-gray-50' : ''}`}>{day > 0 && day < 31 ? day : ''}</span>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimeOffView({ isAdmin, currentUser, leaves, onAddLeave, onUpdateLeaveStatus }) {
  const [requestOpen, setRequestOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Time Off');
  const visibleLeaves = leaves.filter((leave) => `${leave.name} ${leave.start} ${leave.end} ${leave.type} ${leave.status}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="p-5">
      <section className="overflow-hidden border border-gray-400 bg-white">
        <div className="flex border-b border-gray-400">
          {['Time Off', 'Allocation'].map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`px-5 py-2 font-semibold ${tab === item ? 'bg-rose-100' : ''}`}>{item}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-6 border-b border-gray-400 px-4 py-2">
          <button onClick={() => setRequestOpen(true)} className="bg-fuchsia-400 px-5 py-1 font-bold text-white">NEW</button>
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-72 rounded border border-gray-400 px-3 py-1 text-sm" placeholder="Searchbar" />
        </div>
        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          <div><h2 className="text-lg font-semibold text-blue-600">Paid time Off</h2><p className="mt-1 text-sm">{tab === 'Allocation' ? '24 Days Allocated' : '24 Days Available'}</p></div>
          <div><h2 className="text-lg font-semibold text-blue-600">Sick time off</h2><p className="mt-1 text-sm">{tab === 'Allocation' ? '07 Days Allocated' : '07 Days Available'}</p></div>
        </div>

        {isAdmin ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-t border-gray-400 text-sm">
              <thead><tr className="text-left">{['Name', 'Start Date', 'End Date', 'Time off Type', 'Status', 'Actions'].map((head) => <th key={head} className="border-r border-gray-400 px-3 py-2 last:border-r-0">{head}</th>)}</tr></thead>
              <tbody>
                {visibleLeaves.map((leave) => (
                  <tr key={leave.id} className="border-t border-gray-300">
                    <td className="border-r border-gray-400 px-3 py-3">{leave.name}</td>
                    <td className="border-r border-gray-400 px-3 py-3">{leave.start}</td>
                    <td className="border-r border-gray-400 px-3 py-3">{leave.end}</td>
                    <td className="border-r border-gray-400 px-3 py-3 text-blue-600">{leave.type}</td>
                    <td className="border-r border-gray-400 px-3 py-3">{leave.status}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => onUpdateLeaveStatus(leave.id, 'Rejected')} className="h-5 w-9 rounded bg-red-500" title="Reject" />
                        <button onClick={() => onUpdateLeaveStatus(leave.id, 'Approved')} className="h-5 w-9 rounded bg-green-500" title="Approve" />
                      </div>
                    </td>
                  </tr>
                ))}
                {!visibleLeaves.length && <tr><td colSpan="6" className="px-3 py-6 text-center text-gray-500">No time off records found.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-t border-gray-300 p-4"><CalendarGrid leaves={visibleLeaves} /></div>
        )}
      </section>

      {requestOpen && <LeaveRequestModal currentUser={currentUser} onClose={() => setRequestOpen(false)} onSubmit={(leave) => { onAddLeave(leave); setRequestOpen(false); }} />}
    </main>
  );
}

function LeaveRequestModal({ currentUser, onClose, onSubmit }) {
  const [form, setForm] = useState({ employee: currentUser.name || '[Employee]', type: 'Paid time off', start: '', end: '' });

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <form className="w-full max-w-lg rounded-lg border border-gray-300 bg-white p-5 shadow-xl" onSubmit={(event) => { event.preventDefault(); onSubmit({ id: Date.now(), name: form.employee, start: formatDate(form.start), end: formatDate(form.end), type: form.type, status: 'Pending' }); }}>
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3"><h2 className="font-semibold">Time off Type Request</h2><button type="button" onClick={onClose}>x</button></div>
        <div className="grid gap-4 text-sm">
          <label className="grid gap-1">Employee <input value={form.employee} onChange={(event) => setForm({ ...form, employee: event.target.value })} className="rounded border border-gray-300 px-3 py-2" required /></label>
          <label className="grid gap-1">Time off Type <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="rounded border border-gray-300 px-3 py-2"><option>Paid time off</option><option>Sick time off</option><option>Unpaid Leaves</option></select></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">From <input value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} type="date" className="rounded border border-gray-300 px-3 py-2" required /></label>
            <label className="grid gap-1">To <input value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} type="date" className="rounded border border-gray-300 px-3 py-2" required /></label>
          </div>
          <label className="grid gap-1">Attachment <input type="file" className="rounded border border-gray-300 px-3 py-2" /></label>
        </div>
        <div className="mt-5 flex gap-2"><button className="rounded bg-fuchsia-400 px-4 py-2 text-sm font-bold text-white">Submit</button><button type="button" onClick={onClose} className="rounded bg-gray-200 px-4 py-2 text-sm">Discard</button></div>
      </form>
    </div>
  );
}

function NewEmployeeModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', mobile: '', jobPosition: '', department: '' });
  const update = (key, value) => setForm({ ...form, [key]: value });

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <form className="w-full max-w-xl rounded-lg bg-white p-5 shadow-xl" onSubmit={(event) => { event.preventDefault(); onCreate(form); }}>
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3"><h2 className="font-semibold">New Employee</h2><button type="button" onClick={onClose}>x</button></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-gray-700">First Name<input value={form.firstName} onChange={(event) => update('firstName', event.target.value)} required className="rounded border border-gray-300 px-3 py-2 font-normal outline-none focus:border-sky-400" /></label>
          <label className="grid gap-1 text-sm font-semibold text-gray-700">Last Name<input value={form.lastName} onChange={(event) => update('lastName', event.target.value)} required className="rounded border border-gray-300 px-3 py-2 font-normal outline-none focus:border-sky-400" /></label>
          <label className="grid gap-1 text-sm font-semibold text-gray-700">Email<input value={form.email} onChange={(event) => update('email', event.target.value)} type="email" required className="rounded border border-gray-300 px-3 py-2 font-normal outline-none focus:border-sky-400" /></label>
          <label className="grid gap-1 text-sm font-semibold text-gray-700">Mobile<input value={form.mobile} onChange={(event) => update('mobile', event.target.value)} className="rounded border border-gray-300 px-3 py-2 font-normal outline-none focus:border-sky-400" /></label>
          <label className="grid gap-1 text-sm font-semibold text-gray-700">Job Position<input value={form.jobPosition} onChange={(event) => update('jobPosition', event.target.value)} required className="rounded border border-gray-300 px-3 py-2 font-normal outline-none focus:border-sky-400" /></label>
          <label className="grid gap-1 text-sm font-semibold text-gray-700">Department<input value={form.department} onChange={(event) => update('department', event.target.value)} className="rounded border border-gray-300 px-3 py-2 font-normal outline-none focus:border-sky-400" /></label>
        </div>
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded border border-gray-300 px-4 py-2 text-sm">Cancel</button><button className="rounded bg-sky-600 px-4 py-2 text-sm font-bold text-white">Create</button></div>
      </form>
    </div>
  );
}

export default function Dashboard({ currentUser = {}, onSelectEmployee, onOpenProfile, onLogout }) {
  const [activeModule, setActiveModule] = useState('Employees');
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [attendanceRows, setAttendanceRows] = useState(INITIAL_ATTENDANCE);
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);
  const [attendanceStatus, setAttendanceStatus] = useState('absent');
  const [checkInTime, setCheckInTime] = useState(null);
  const [lastDuration, setLastDuration] = useState('');
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false);
  const isAdmin = currentUser.role === 'Admin';

  const visibleEmployees = useMemo(() => {
    if (isAdmin) return employees;
    const ownEmployee = employees.find((employee) => employee.employeeId === currentUser.employeeId);
    if (ownEmployee) return [ownEmployee];
    return [{ id: 'current-user', name: currentUser.name || 'My Profile', employeeId: currentUser.employeeId || 'EMP-001', jobPosition: 'Employee', email: currentUser.email || 'employee@company.com', mobile: '+91 98765 43210', status: attendanceStatus, avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(currentUser.name || 'User')}` }];
  }, [attendanceStatus, currentUser.email, currentUser.employeeId, currentUser.name, employees, isAdmin]);

  const handleCreateEmployee = (form) => {
    const employee = {
      id: Date.now(),
      name: `${form.firstName} ${form.lastName}`.trim(),
      employeeId: makeEmployeeId(form.firstName, form.lastName, employees.length + 1),
      jobPosition: form.jobPosition,
      email: form.email,
      mobile: form.mobile || '+91 00000 00000',
      status: 'absent',
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(`${form.firstName} ${form.lastName}`)}`,
    };
    setEmployees((items) => [employee, ...items]);
    setNewEmployeeOpen(false);
  };

  const handleCheckIn = () => {
    setAttendanceStatus('present');
    setCheckInTime(new Date());
    setLastDuration('');
  };

  const handleCheckOut = () => {
    if (!checkInTime) return;
    const minutes = Math.max(1, Math.round((Date.now() - checkInTime.getTime()) / 60000));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const duration = `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
    const now = new Date();
    setAttendanceStatus('absent');
    setLastDuration(`${hours}h ${remainingMinutes}m since check-in`);
    setAttendanceRows((rows) => [{
      id: Date.now(),
      name: currentUser.name || 'Me',
      date: now.toLocaleDateString('en-GB'),
      checkIn: checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkOut: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hours: duration,
      extra: hours >= 9 ? `${String(hours - 8).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}` : '00:00',
    }, ...rows]);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 lg:flex">
      {isAdmin && <AdminPanel currentUser={currentUser} activeModule={activeModule} onModuleChange={setActiveModule} />}
      <div className="min-w-0 flex-1">
        <TopBar activeModule={activeModule} onModuleChange={setActiveModule} currentUser={currentUser} onOpenProfile={onOpenProfile} onLogout={onLogout} attendanceStatus={attendanceStatus} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} lastDuration={lastDuration} />
        {activeModule === 'Employees' && <EmployeesView isAdmin={isAdmin} employees={visibleEmployees} onSelectEmployee={onSelectEmployee} onNewEmployee={() => setNewEmployeeOpen(true)} />}
        {activeModule === 'Attendance' && <AttendanceView isAdmin={isAdmin} currentUser={currentUser} attendanceRows={attendanceRows} />}
        {activeModule === 'Time Off' && <TimeOffView isAdmin={isAdmin} currentUser={currentUser} leaves={leaves} onAddLeave={(leave) => setLeaves((items) => [leave, ...items])} onUpdateLeaveStatus={(id, status) => setLeaves((items) => items.map((leave) => leave.id === id ? { ...leave, status } : leave))} />}
      </div>
      {newEmployeeOpen && <NewEmployeeModal onClose={() => setNewEmployeeOpen(false)} onCreate={handleCreateEmployee} />}
    </div>
  );
}
