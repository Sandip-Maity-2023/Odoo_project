import React, { useState } from 'react';

export default function LeaveRequest() {
    const [leave, setLeave] = useState({ type: 'Paid', start: '', end: '', reason: '' });

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded shadow-lg mt-10">
            <h2 className="text-xl font-bold mb-4">Apply for Time Off</h2>
            <div className="space-y-4">
                <select 
                    className="w-full border p-2 rounded"
                    onChange={(e) => setLeave({...leave, type: e.target.value})}
                >
                    <option>Paid</option>
                    <option>Sick</option>
                    <option>Unpaid</option>
                </select>
                <div className="flex gap-2">
                    <input type="date" className="border p-2 w-full" />
                    <input type="date" className="border p-2 w-full" />
                </div>
                <textarea 
                    placeholder="Remarks/Reason" 
                    className="w-full border p-2 h-24"
                    onChange={(e) => setLeave({...leave, reason: e.target.value})}
                ></textarea>
                <button className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700">
                    Submit Request
                </button>
            </div>
        </div>
    );
}
