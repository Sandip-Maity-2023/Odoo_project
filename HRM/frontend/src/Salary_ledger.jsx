import React, { useState } from 'react';

export default function EmployeeProfileView({ employeeData = {}, onBack }) {
  const [activeTab, setActiveTab] = useState('Private Info');

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      {/* Navbar header */}
      <div className="bg-white border-b border-gray-300 px-6 py-3 flex items-center space-x-6">
        <button onClick={onBack} className="text-gray-600 hover:text-black font-semibold text-sm">&larr; Back to Grid</button>
        <span className="text-gray-400">|</span>
        <h1 className="text-lg font-bold text-gray-800">My Profile</h1>
      </div>

      <div className="max-w-4xl mx-auto mt-6 bg-white border border-gray-300 rounded-xl p-8 shadow-sm">
        {/* Profile Header Header Summary Card */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b border-gray-200">
          <div className="w-24 h-24 rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center text-2xl shadow-inner relative">
            ✏️
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{employeeData.name || 'My Name'}</h2>
              <p className="text-sm text-gray-500 mb-2">Job Position</p>
              <div className="space-y-1 text-sm text-gray-700">
                <div><span className="font-semibold">Email:</span> employee@company.com</div>
                <div><span className="font-semibold">Mobile:</span> +91 9876543210</div>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-700 md:border-l md:pl-6 border-gray-200">
              <div><span className="font-semibold">Company:</span> Odoo India</div>
              <div><span className="font-semibold">Department:</span> Engineering</div>
              <div><span className="font-semibold">Manager:</span> HR Admin</div>
              <div><span className="font-semibold">Location:</span> Kolkata, India</div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-300 my-6 overflow-x-auto">
          {['Resume', 'Private Info', 'Salary Info', 'Security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 font-medium text-sm transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab 
                  ? 'border-purple-600 text-purple-600 bg-purple-50/50 rounded-t-lg' 
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Viewport Contents */}
        <div className="bg-white min-h-[250px]">
          {activeTab === 'Private Info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-800">
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Date of Birth:</span> <span className="font-medium">18-06-2004</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Residing Address:</span> <span className="font-medium">Kolkata, WB</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Nationality:</span> <span className="font-medium">Indian</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Personal Email:</span> <span className="font-medium">personal@gmail.com</span></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Gender:</span> <span className="font-medium">Male</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Marital Status:</span> <span className="font-medium">Single</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Date of Joining:</span> <span className="font-medium">01-06-2026</span></div>
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div>
              <h3 className="font-bold text-gray-700 border-b border-gray-300 pb-2 mb-4 text-sm uppercase tracking-wider">Bank Details & Official Identity Keys</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Account Number:</span> <span className="font-mono font-medium">XXXXXXXX5432</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Bank Name:</span> <span className="font-medium">State Bank of India</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-500">IFSC Code:</span> <span className="font-mono font-medium">SBIN0001234</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-500">PAN No:</span> <span className="font-mono font-medium">ABCDE1234F</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-500">UAN No:</span> <span className="font-mono font-medium">100XXXXXXXXX</span></div>
                <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Emp Code:</span> <span className="font-mono font-medium">OI-0042</span></div>
              </div>
            </div>
          )}

          {activeTab === 'Salary Info' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
              🔒 Standard employee access tier active. Salary item breakdown details are restricted exclusively to Admin roles.
            </div>
          )}

          {activeTab === 'Resume' && <div className="text-sm text-gray-500 italic">No resume data uploaded.</div>}
        </div>
      </div>
    </div>
  );
}
