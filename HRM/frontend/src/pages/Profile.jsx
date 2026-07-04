import React, { useState } from 'react';
import logo from '../assets/odoo_img.png';

const salaryRows = [
  ['Month Wage', 'Rs 50,000'],
  ['Yearly Wage', 'Rs 6,00,000'],
  ['Basic Salary', 'Rs 25,000'],
  ['HRA', 'Rs 12,500'],
  ['Standard Allowance', 'Rs 4,167'],
  ['Performance Bonus', 'Rs 2,092.50'],
  ['Leave Travel Allowance', 'Rs 2,092.50'],
  ['Fixed Allowance', 'Rs 2,918'],
  ['PF Employee', 'Rs 3,000'],
  ['PF Employer', 'Rs 3,000'],
  ['Professional Tax', 'Rs 200 / month'],
];

const securityRows = [
  ['Account No', 'XXXXXXXX5432'],
  ['Bank Name', 'State Bank of India'],
  ['IFSC', 'SBIN0001234'],
  ['PAN', 'ABCDE1234F'],
  ['UAN', '100XXXXXXXXX'],
  ['Emp Code', 'OI-0042'],
];

export default function Profile({ currentUser = {}, employee = null, onBack, onLogout }) {
  const [activeTab, setActiveTab] = useState('Resume');
  const [saveMessage, setSaveMessage] = useState('');
  const isAdmin = currentUser.role === 'Admin';
  const profile = employee || {
    name: currentUser.name || 'My Profile',
    employeeId: currentUser.employeeId || 'EMP-001',
    jobPosition: isAdmin ? 'Administrator' : 'Employee',
    email: currentUser.email || 'employee@company.com',
    mobile: '+91 98765 43210',
    avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(currentUser.name || 'User')}`,
  };
  const savedProfile = JSON.parse(localStorage.getItem(`profile:${profile.employeeId}`) || '{}');
  const [resume, setResume] = useState(savedProfile.resume || {
    About: employee?.about || '',
    'What I love about my job': employee?.jobLove || '',
    Interests: employee?.interests || '',
    Skills: employee?.skills || '',
    Certification: employee?.certification || '',
  });
  const [privateInfo, setPrivateInfo] = useState(savedProfile.privateInfo || {
    DOB: '18-06-2004',
    Address: 'Kolkata, West Bengal',
    Nationality: 'Indian',
    'Personal Email': 'personal@gmail.com',
    Gender: 'Male',
    'Marital Status': 'Single',
    'Date of Joining': '01-06-2026',
  });

  const saveProfileDetails = () => {
    localStorage.setItem(`profile:${profile.employeeId}`, JSON.stringify({ resume, privateInfo }));
    setSaveMessage('Profile details saved.');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="text-sm font-semibold text-gray-600 hover:text-purple-700">&lt; Back</button>
          <img src={logo} alt="Company Logo" className="h-8 object-contain" />
          <nav className="hidden gap-5 text-sm font-semibold text-gray-600 md:flex">
            <button>Employees</button>
            <button>Attendance</button>
            <button>Time Off</button>
          </nav>
        </div>
        <button onClick={onLogout} className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Log Out</button>
      </header>

      <main className="mx-auto max-w-5xl p-5">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 border-b border-gray-200 pb-5 md:flex-row">
            <img src={profile.avatar} alt={profile.name} className="h-24 w-24 rounded-full border border-gray-200 bg-gray-50" />
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-sm text-gray-500">{profile.jobPosition}</p>
              </div>
              <div className="grid gap-1 text-sm text-gray-600">
                <p><span className="font-semibold text-gray-800">Login ID:</span> {profile.employeeId}</p>
                <p><span className="font-semibold text-gray-800">Email:</span> {profile.email}</p>
                <p><span className="font-semibold text-gray-800">Mobile:</span> {profile.mobile}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto border-b border-gray-200">
            {['Resume', 'Private Info', 'Salary Info', 'Security'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {saveMessage && <p className="mt-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{saveMessage}</p>}

          <div className="min-h-72 py-5">
            {activeTab === 'Resume' && (
              <div>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.keys(resume).map((field) => (
                    <label key={field} className="grid gap-1 text-sm font-semibold text-gray-700">
                      {field}
                      <textarea
                        value={resume[field]}
                        onChange={(event) => setResume({ ...resume, [field]: event.target.value })}
                        className="min-h-24 resize-none rounded-md border border-gray-200 bg-white p-3 font-normal text-gray-700 outline-none focus:border-purple-400"
                        placeholder={`Add ${field.toLowerCase()}`}
                      />
                    </label>
                  ))}
                </div>
                <button onClick={saveProfileDetails} className="mt-5 rounded-md bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700">Save Resume</button>
              </div>
            )}

            {activeTab === 'Private Info' && (
              <div>
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  {Object.entries(privateInfo).map(([label, value]) => (
                    <label key={label} className="grid gap-1 font-semibold text-gray-700">
                      {label}
                      <input
                        value={value}
                        onChange={(event) => setPrivateInfo({ ...privateInfo, [label]: event.target.value })}
                        className="rounded-md border border-gray-200 px-3 py-2 font-normal outline-none focus:border-purple-400"
                      />
                    </label>
                  ))}
                </div>
                <button onClick={saveProfileDetails} className="mt-5 rounded-md bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700">Save Private Info</button>
              </div>
            )}

            {activeTab === 'Salary Info' && (
              isAdmin ? (
                <div className="grid gap-2 md:grid-cols-2">
                  {salaryRows.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 rounded-md border border-gray-100 px-3 py-2 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                  Salary information is restricted to Admin users.
                </div>
              )
            )}

            {activeTab === 'Security' && (
              <div className="grid gap-2 md:grid-cols-2">
                {securityRows.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 rounded-md border border-gray-100 px-3 py-2 text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-mono font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
