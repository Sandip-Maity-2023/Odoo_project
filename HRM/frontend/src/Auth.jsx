import React, { useState } from 'react';
import logo from './assets/odoo_img.png'; // Ensure this path points to your Odoo logo in the public folder

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Odoo permanent logo reference
  //const ODOO_LOGO_URL = "./assets/odoo_img.png"; // Ensure this path points to your Odoo logo in the public folder

  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with ID/Email:", loginData);
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Registering Tenant Company:", signUpData);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-md border border-gray-200">
        
        {/* Permanent Odoo Logo */}
        <div className="w-full flex justify-center mb-8">
          <img 
            src={logo} 
            alt="Odoo Logo" 
            className="h-10 object-contain"
          />
        </div>

        {isLogin ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Login Id/Email :-</label>
              <input
                type="text"
                required
                className="w-full border border-black rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                value={loginData.identifier}
                onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Password :-</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full border border-black rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#d8b4fe] hover:bg-[#c084fc] text-purple-900 font-bold uppercase tracking-wider py-2 rounded transition-colors text-center"
            >
              SIGN IN
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-sm text-gray-700 hover:underline"
              >
                Don’t have an Account? <span className="text-purple-700 font-semibold">Sign Up</span>
              </button>
            </div>
          </form>
        ) : (
          /* SIGN UP FORM (Logo Upload removed entirely per your instruction) */
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Company Name :-</label>
              <input
                type="text"
                required
                className="w-full border-b border-black focus:outline-none focus:border-purple-500 py-1"
                value={signUpData.companyName}
                onChange={(e) => setSignUpData({ ...signUpData, companyName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Name :-</label>
              <input
                type="text"
                required
                className="w-full border-b border-black focus:outline-none focus:border-purple-500 py-1"
                value={signUpData.name}
                onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Email :-</label>
              <input
                type="email"
                required
                className="w-full border-b border-black focus:outline-none focus:border-purple-500 py-1"
                value={signUpData.email}
                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Phone :-</label>
              <input
                type="tel"
                required
                className="w-full border-b border-black focus:outline-none focus:border-purple-500 py-1"
                value={signUpData.phone}
                onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Password :-</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full border-b border-black focus:outline-none focus:border-purple-500 py-1"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-2 bottom-1 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Confirm Password :-</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="w-full border-b border-black focus:outline-none focus:border-purple-500 py-1"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-2 bottom-1 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#d8b4fe] hover:bg-[#c084fc] text-purple-900 font-bold py-2 rounded mt-4 transition-colors"
            >
              Sign Up
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-xs text-gray-700 hover:underline"
              >
                Already have an account? <span className="text-purple-700 font-semibold">Sign In</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
