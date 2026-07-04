import React, { useState } from 'react';

// Mock Data representing Employee statuses
const MOCK_EMPLOYEES = [
  { id: 1, name: 'Shibashis Das', status: 'present', avatar: 'https://via.placeholder.com/150' },
  { id: 2, name: 'Sreejith S', status: 'leave', avatar: 'https://via.placeholder.com/150' },
  { id: 3, name: 'Rohit Kumar', status: 'absent', avatar: 'https://via.placeholder.com/150' },
  { id: 4, name: 'Ananya Sen', status: 'present', avatar: 'https://via.placeholder.com/150' },
];

export default function Dashboard({ onSelectEmployee, userRole }) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState('');

  const handleCheckInToggle = () => {
    if (!isCheckedIn) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCheckInTime(now);
      setIsCheckedIn(true);
    } else {
      setIsCheckedIn(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <span className="text-green-500 text-xl" title="Present">🟢</span>;
      case 'leave': return <span className="text-xl" title="On Leave">✈️</span>;
      case 'absent': return <span className="text-yellow-500 text-xl" title="Absent">🟡</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-300 px-6 py-3 flex items-center justify-between relative shadow-sm">
        <div className="flex items-center space-x-8">
          <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Odoo-logo.svg" alt="Odoo Logo" className="h-6" />
          <div className="hidden md:flex space-x-6 text-gray-700 font-medium">
            <button className="border-b-2 border-purple-600 text-purple-600 pb-1">Employees</button>
            <button className="hover:text-purple-600 transition">Attendance</button>
            <button className="hover:text-purple-600 transition">Time Off</button>
          </div>
        </div>

        {/* Systray Actions & Profile */}
        <div className="flex items-center space-x-4">
          {/* Systray Attendance Box */}
          <div className="border border-gray-300 rounded px-3 py-1 bg-gray-50 flex items-center space-x-3 text-sm">
            {isCheckedIn ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Since {checkInTime}</span>
                <button onClick={handleCheckInToggle} className="bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded border border-red-300 hover:bg-red-200">
                  Check Out -&gt;
                </button>
              </div>
            ) : (
              <button onClick={handleCheckInToggle} className="bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded border border-green-300 hover:bg-green-200">
                Check IN -&gt;
              </button>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="w-9 h-9 rounded-full bg-blue-400 border border-gray-400 overflow-hidden focus:outline-none">
              <img src="https://via.placeholder.com/150" alt="Avatar" />
            </button>
            
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg py-1 z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</button>
                <hr className="border-gray-200" />
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Log Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Grid View Area */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-1.5 rounded shadow text-sm uppercase">
            New
          </button>
          <input type="text" placeholder="Search..." className="border border-gray-300 rounded px-3 py-1 w-64 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {MOCK_EMPLOYEES.map((emp) => (
            <div 
              key={emp.id}
              onClick={() => onSelectEmployee(emp)}
              className="bg-white border border-gray-300 rounded-xl p-5 relative shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center group"
            >
              <div className="absolute top-3 right-3">
                {getStatusIcon(emp.status)}
              </div>
              <div className="w-20 h-20 rounded-full border border-gray-300 bg-gray-100 overflow-hidden mb-4">
                <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-gray-800 text-center group-hover:text-purple-600 transition">
                [{emp.name}]
              </h3>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

