import React from 'react';

const EmployeeCard = ({ employee }) => {
  // Status Indicator logic
  const statusColors = {
    Present: 'bg-green-500',
    Absent: 'bg-yellow-500',
    Leave: 'bg-blue-400', // Airplane icon would go here
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-relative cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
           <img src="https://via.placeholder.com/150" alt="avatar" />
        </div>
        {/* Status Dot */}
        <div className={`w-3 h-3 rounded-full ${statusColors[employee.status] || 'bg-red-500'}`}></div>
      </div>
      <div className="mt-3">
        <h3 className="font-bold text-gray-800 text-sm">{employee.name}</h3>
        <p className="text-xs text-gray-500">{employee.jobPosition}</p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <div className="flex gap-8 items-center">
          <span className="font-bold text-purple-700 text-xl">Odoo</span>
          <div className="flex gap-4 text-sm font-medium text-gray-600">
            <button className="text-purple-600 border-b-2 border-purple-600">Employees</button>
            <button>Attendance</button>
            <button>Time Off</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-red-500 rounded-full"></div> {/* Profile Avatar */}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        <div className="flex justify-between mb-6">
          <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold">NEW</button>
          <input 
            type="text" 
            placeholder="Search..." 
            className="border rounded px-3 py-1 text-sm w-64 focus:outline-purple-500"
          />
        </div>

        {/* Employee Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Example Data mapping */}
          {[1,2,3,4,5,6,7,8].map(i => (
            <EmployeeCard key={i} employee={{name: "Employee Name", jobPosition: "Developer", status: "Present"}} />
          ))}
        </div>
      </main>
      
      {/* Systray Check-in Widget (Wireframe Bottom Right) */}
      <div className="fixed bottom-5 right-5 bg-white shadow-xl border p-4 rounded-lg">
         <p className="text-xs text-gray-400 mb-2">Since 09:00 AM</p>
         <button className="bg-white border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 text-sm">
            Check Out →
         </button>
      </div>
    </div>
  );
}
