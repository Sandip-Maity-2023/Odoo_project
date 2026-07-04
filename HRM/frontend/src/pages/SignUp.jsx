import React from 'react';

export default function Signup() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border-t-4 border-purple-500">
        <div className="text-center mb-4">
           <div className="bg-gray-200 h-10 w-40 mx-auto rounded mb-2 text-xs flex items-center justify-center">App/Web Logo</div>
           <h2 className="font-bold text-gray-600">Admin Registration</h2>
        </div>

        <form className="space-y-3">
          <div className="flex items-center gap-2">
            <input placeholder="Company Name" className="flex-1 border-b border-gray-300 py-1 focus:outline-none focus:border-purple-500" />
            <label className="bg-blue-600 p-1 rounded text-white cursor-pointer">
               <span className="text-xs">Upload Logo</span>
               <input type="file" className="hidden" />
            </label>
          </div>
          <input placeholder="Admin Name" className="w-full border-b border-gray-300 py-1 focus:outline-none" />
          <input placeholder="Email" className="w-full border-b border-gray-300 py-1 focus:outline-none" />
          <input placeholder="Phone" className="w-full border-b border-gray-300 py-1 focus:outline-none" />
          <input type="password" placeholder="Password" className="w-full border-b border-gray-300 py-1 focus:outline-none" />
          <input type="password" placeholder="Confirm Password" className="w-full border-b border-gray-300 py-1 focus:outline-none" />
          
          <button className="w-full bg-purple-400 text-white py-2 rounded-md font-bold mt-4 shadow-sm">
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500">
          Already have an account? <a href="/login" className="text-purple-600 hover:underline">Sign In</a>
        </p>
      </div>
    </div>
  );
}
