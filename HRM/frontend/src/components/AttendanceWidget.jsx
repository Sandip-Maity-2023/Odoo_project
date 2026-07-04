import React, { useState } from 'react';

export default function AttendanceWidget() {
  const [status, setStatus] = useState('Absent');
  const [time, setTime] = useState(null);

  const handleAttendance = async (type) => {
    try {
      const endpoint = type === 'in' ? '/api/attendance/checkin' : '/api/attendance/checkout';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Attendance update failed');

      setStatus(type === 'in' ? 'Present' : 'Absent');
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      alert(`Successfully checked ${type}`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white border border-gray-200 shadow-2xl p-5 rounded-xl w-64">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-600">Attendance</span>
        <div className={`w-3 h-3 rounded-full ${status === 'Present' ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      {status === 'Present' && <p className="text-xs text-gray-400 mb-3 text-center">In since: {time}</p>}

      {status === 'Absent' ? (
        <button
          onClick={() => handleAttendance('in')}
          className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition"
        >
          Check IN -&gt;
        </button>
      ) : (
        <button
          onClick={() => handleAttendance('out')}
          className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-50 transition"
        >
          Check OUT &lt;-
        </button>
      )}
    </div>
  );
}
