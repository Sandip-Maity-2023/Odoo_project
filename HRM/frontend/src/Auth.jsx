// //login and sign up page are combined in this file. 
// // 
// //The user can switch between login and sign up forms using the buttons provided. The forms are styled using Tailwind CSS classes, and the component manages its state using React's useState hook.


// import React, { useMemo, useState,useEffect } from 'react';
// import logo from './assets/odoo_img.png';
// import {FaEye, FaEyeSlash} from 'react-icons/fa';
// import './Auth.css'; // Import the CSS file for styling

// const API_URL = import.meta.env.VITE_API_URL || '';
// const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/; //You said: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;This is a standard strong password validation regex. Here is exactly what each part of the expression checks for:^: Assures the validation checks from the very start of the text.(?=.*[a-z]): Requires at least one lowercase letter.(?=.*[A-Z]): Requires at least one uppercase letter.(?=.*\d): Requires at least one number (0-9).(?=.*[^A-Za-z\d]): Requires at least one special character (anything that is not a letter or digit, like @, #, $, etc.)..{8,}: Forces the total password length to be at least 8 characters long.$/: Assures the validation extends all the way to the end of the text.

// const emptySignup = {
//   companyName: '',
//   name: '',
//   email: '',
//   phone: '',
//   password: '',
//   confirmPassword: '',
//   companyLogo: null,
// };

// const slides=[
//   {
//     image:'https://unsplash.com/photos/Py5wyT0O3Rw',
//     title:'',
//     description:''
//   },{
//     image:'',
//     title:'',
//     description:''
//   },{
//     image:'',
//     title:'',
//     description:''
//   },{
//     image:'',
//     title:'',
//     description:''
//   }
// ]
// function EyeButton({ visible, onClick }) {
//   return (
//     <button type="button" className="auth-eye" onClick={onClick} aria-label={visible ? 'Hide password' : 'Show password'}>
//       {visible ? <FaEyeSlash /> : <FaEye />}
//     </button>
//   );
// }

// function Spinner() {
//   return <span className="spinner" aria-hidden="true" />;
// }

// export default function Auth({ onLogin = () => {} }) {
//   const [mode, setMode] = useState('login');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState(null); // a state variable to handle application notifications or messages to the user, such as success or error messages.
//   const [pendingUser, setPendingUser] = useState(null);
//   const [loginData, setLoginData] = useState({ identifier: '', password: '' });
//   const [signUpData, setSignUpData] = useState(emptySignup);
//   const [resetData, setResetData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

//   const [currentSlide, setCurrentSlide] = useState(0);
//   useEffect(() => {
//     const timer=setInterval(() => {
//       setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
//     }, 4000); // Change slide every 5 seconds

//     return () => clearInterval(timer); // Cleanup on unmount
//   }, []);


//   const logoPreview = useMemo(() => {
//     if (!signUpData.companyLogo?.data) return null;
//     return `data:${signUpData.companyLogo.mimeType};base64,${signUpData.companyLogo.data}`;          //data URL/ base64 encoded string that represents the image file. It allows the image to be displayed directly in the browser without needing to reference an external file.
//   }, [signUpData.companyLogo]);

//   const showToast = (message, type = 'error') => setToast({ message, type });

//   const readResponse = async (response) => {
//     const data = await response.json().catch(() => ({}));
//     if (!response.ok) throw new Error(data.message || data.error || 'Request failed');
//     return data;
//   };

//   const request = async (path, options = {}) => readResponse(await fetch(`${API_URL}${path}`, {
//     ...options,
//     headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
//   }));

//   const validateSignup = () => {
//     if (!signUpData.companyName || !signUpData.name || !signUpData.email || !signUpData.phone || !signUpData.password) return 'All fields are required.';
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) return 'Enter a valid email address.';
//     if (!/^\+?\d{10,15}$/.test(signUpData.phone)) return 'Phone must be 10 to 15 digits.';
//     if (!passwordRule.test(signUpData.password)) return 'Password needs 8+ chars, uppercase, lowercase, number and special character.';
//     if (signUpData.password !== signUpData.confirmPassword) return 'Passwords do not match.';
//     return '';
//   };

//   const handleLogoChange = (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;
//     if (!file.type.startsWith('image/')) return showToast('Please upload an image logo.');
//     if (file.size > 1024 * 1024) return showToast('Logo must be 1MB or smaller.');
//     const reader = new FileReader();
//     reader.onload = () => {
//       const data = String(reader.result).split(',')[1];
//       setSignUpData((current) => ({ ...current, companyLogo: { data, mimeType: file.type, fileName: file.name } }));
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleLoginSubmit = async (event) => {
//     event.preventDefault();
//     setLoading(true);
//     setToast(null);
//     try {
//       const data = await request('/api/auth/login', {
//         method: 'POST',
//         body: JSON.stringify({ loginIdentifier: loginData.identifier.trim(), password: loginData.password }),
//       });
//       localStorage.setItem('accessToken', data.accessToken);
//       localStorage.setItem('refreshToken', data.refreshToken);
//       localStorage.setItem('token', data.accessToken);
//       localStorage.setItem('userInfo', JSON.stringify(data.user));
//       if (data.user.mustChangePassword) {
//         setPendingUser(data.user);
//         setMode('reset');
//         showToast('Please set a new password to continue.', 'success');
//       } else {
//         onLogin(data.user);
//       }
//     } catch (error) {
//       showToast(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSignUpSubmit = async (event) => {
//     event.preventDefault();
//     const validationError = validateSignup();
//     if (validationError) return showToast(validationError);
//     setLoading(true);
//     setToast(null);
//     try {
//       const data = await request('/api/auth/signup', { method: 'POST', body: JSON.stringify(signUpData) });
//       showToast(`Admin registered. Login ID: ${data.loginId}`, 'success');
//       setSignUpData(emptySignup);
//       setMode('login');
//     } catch (error) {
//       showToast(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePasswordReset = async (event) => {
//     event.preventDefault();
//     if (!passwordRule.test(resetData.newPassword)) return showToast('New password does not meet the security rules.');
//     if (resetData.newPassword !== resetData.confirmNewPassword) return showToast('New passwords do not match.');
//     setLoading(true);
//     try {
//       const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
//       const data = await request('/api/auth/change-password', {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${accessToken}` },
//         body: JSON.stringify({ currentPassword: resetData.currentPassword, newPassword: resetData.newPassword }),
//       });
//       const updatedUser = { ...(pendingUser || {}), ...data.user, mustChangePassword: false };
//       localStorage.setItem('userInfo', JSON.stringify(updatedUser));
//       showToast('Password changed successfully.', 'success');
//       onLogin(updatedUser);
//     } catch (error) {
//       showToast(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="auth-shell">
//       <section className="auth-card">

//         <div className="auth-logo-wrap">
//           <img src={logoPreview || logo} alt="Company logo" className="auth-logo" />
//         </div>

//         {toast && <div className={`auth-toast ${toast.type === 'success' ? 'success' : ''}`}>{toast.message}</div>}

//         {mode === 'login' && (
//           <form onSubmit={handleLoginSubmit} className="auth-form">
//             {/* <label>Login ID, Employee ID or Email<input value={loginData.identifier} onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })} required autoComplete="username" /></label> */}
//             <label>Login ID / Employee ID / Email<input value={loginData.identifier} onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })} required autoComplete="username" /></label>
//             <label>Password<div className="password-row"><input type={showPassword ? 'text' : 'password'} value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required autoComplete="current-password" /><EyeButton visible={showPassword} onClick={() => setShowPassword((v) => !v)} /></div></label>
//             <button className="primary-btn" disabled={loading}>{loading && <Spinner />} SIGN IN</button>
//             <button type="button" className="text-link" onClick={() => { setMode('signup'); setToast(null); }}>Don't have an Account? Sign Up</button>
//           </form>
//         )}

//         {mode === 'signup' && (
//           <form onSubmit={handleSignUpSubmit} className="auth-form">
//             <label>Company Name<input value={signUpData.companyName} onChange={(e) => setSignUpData({ ...signUpData, companyName: e.target.value })} required /></label>
//             <label className="upload-box"><span>Upload Company Logo</span><input type="file" accept="image/*" onChange={handleLogoChange} />{logoPreview && <img src={logoPreview} alt="Logo preview" />}</label>
//             <label>Employee Name<input value={signUpData.name} onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })} required /></label>
//             <label>Email<input type="email" value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} required /></label>
//             <label>Phone<input value={signUpData.phone} onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value.replace(/[^\d+]/g, '') })} required /></label>
//             <label>Password<div className="password-row"><input type={showPassword ? 'text' : 'password'} value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} required /><EyeButton visible={showPassword} onClick={() => setShowPassword((v) => !v)} /></div></label>
//             <label>Confirm Password<div className="password-row"><input type={showConfirmPassword ? 'text' : 'password'} value={signUpData.confirmPassword} onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })} required /><EyeButton visible={showConfirmPassword} onClick={() => setShowConfirmPassword((v) => !v)} /></div></label>
//             <button className="primary-btn" disabled={loading}>{loading && <Spinner />} SIGN UP</button>
//             <button type="button" className="text-link" onClick={() => { setMode('login'); setToast(null); }}>Already have an account ? Sign In</button>
//           </form>
//         )}

//         {mode === 'reset' && (
//           <form onSubmit={handlePasswordReset} className="auth-form">
//             <label>Temporary Password<input type="password" value={resetData.currentPassword} onChange={(e) => setResetData({ ...resetData, currentPassword: e.target.value })} required /></label>
//             <label>New Password<input type="password" value={resetData.newPassword} onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })} required /></label>
//             <label>Confirm New Password<input type="password" value={resetData.confirmNewPassword} onChange={(e) => setResetData({ ...resetData, confirmNewPassword: e.target.value })} required /></label>
//             <button className="primary-btn" disabled={loading}>{loading && <Spinner />} Change Password</button>
//           </form>
//         )}
//       </section>

//       {/* Right animated Carousel section*/}
//       <section className="auth-carousel">
//         {slides.map((slide, index) => (
//           <div key={index} className={`carousel-slide ${index === currentSlide ? 'active' : ''}`} style={{backgroundImage: `url(${slide.image})`}}>
//             <div className="carousel-overlay" />
//             <div className="carousel-content">
//               <h3>{slide.title}</h3>
//               <p>{slide.description}</p>
//             </div>
//           </div>
//         ))}

//         {/* Pagination dots */}
//         <div className="carousel-dots">
//           {slides.map((_,index)=>(<button key={index} type='button' className={`dot ${index===currentSlide?'active':''}`} onClick={()=>setCurrentSlide(index)} aria-label={`Go to slide ${index+1}`}/>))}
//         </div>
//       </section>
//     </main>
//   );
// }  


import React, { useMemo, useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './auth.css';

// Fallback logo if local asset path fails
import defaultLogo from './assets/odoo_img.png'; 

const API_URL = import.meta.env.VITE_API_URL || '';
const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const CAROUSEL_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
    title: 'Welcome to Human Resource Management',
    description: 'Log in with your registration number and password.',
  },
  {
    image: 'https://cdn.phototourl.com/free/2026-08-31-c29c833d-ce1d-437f-adfd-3f003a247cb1.jpg',
    title: 'Empowering Education',
    description: 'Access all your academic tools and campus updates in one place.',
  },
  {
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200',
    title: 'Collaborative Learning',
    description: 'Connect with peers and instructors effortlessly.',
  },
  {
    image: 'https://cdn.phototourl.com/free/2026-08-31-32e40c8c-1d80-4ae5-9e7f-329826440486.jpg',
    title: 'Stay Updated',
    description: 'Check your details and update your profile information easily.',
  },
  {
    image: 'https://cdn.phototourl.com/free/2026-08-31-7b9568db-01dc-4e08-b7b0-2fec3e0f6bef.jpg',
    title: 'Greetings!',
    description: 'Connect - Collaborate - Learn - Grow. We are here to support your journey every step of the way.',
  },
];

const emptySignup = {
  companyName: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  companyLogo: null,
};

function EyeButton({ visible, onClick }) {
  return (
    <button type="button" className="auth-eye" onClick={onClick} aria-label={visible ? 'Hide password' : 'Show password'}>
      {visible ? <FaEyeSlash /> : <FaEye />}
    </button>
  );
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

export default function Auth({ onLogin = () => {} }) {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [signUpData, setSignUpData] = useState(emptySignup);
  const [resetData, setResetData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const logoPreview = useMemo(() => {
    if (!signUpData.companyLogo?.data) return null;
    return `data:${signUpData.companyLogo.mimeType};base64,${signUpData.companyLogo.data}`;
  }, [signUpData.companyLogo]);

  const showToast = (message, type = 'error') => setToast({ message, type });

  const readResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || 'Request failed');
    return data;
  };

  const request = async (path, options = {}) => readResponse(await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  }));

  const validateSignup = () => {
    if (!signUpData.companyName || !signUpData.name || !signUpData.email || !signUpData.phone || !signUpData.password) return 'All fields are required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) return 'Enter a valid email address.';
    if (!/^\+?\d{10,15}$/.test(signUpData.phone)) return 'Phone must be 10 to 15 digits.';
    if (!passwordRule.test(signUpData.password)) return 'Password needs 8+ chars, uppercase, lowercase, number and special character.';
    if (signUpData.password !== signUpData.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToast('Please upload an image logo.');
    if (file.size > 1024 * 1024) return showToast('Logo must be 1MB or smaller.');
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result).split(',')[1];
      setSignUpData((current) => ({ ...current, companyLogo: { data, mimeType: file.type, fileName: file.name } }));
    };
    reader.readAsDataURL(file);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setToast(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setToast(null);
    try {
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ loginIdentifier: loginData.identifier.trim(), password: loginData.password }),
      });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      if (data.user.mustChangePassword) {
        setPendingUser(data.user);
        setMode('reset');
        showToast('Please set a new password to continue.', 'success');
      } else {
        onLogin(data.user);
      }
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateSignup();
    if (validationError) return showToast(validationError);
    setLoading(true);
    setToast(null);
    try {
      const data = await request('/api/auth/signup', { method: 'POST', body: JSON.stringify(signUpData) });
      showToast(`Admin registered. Login ID: ${data.loginId}`, 'success');
      setSignUpData(emptySignup);
      setMode('login');
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    if (!passwordRule.test(resetData.newPassword)) return showToast('New password does not meet the security rules.');
    if (resetData.newPassword !== resetData.confirmNewPassword) return showToast('New passwords do not match.');
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const data = await request('/api/auth/change-password', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ currentPassword: resetData.currentPassword, newPassword: resetData.newPassword }),
      });
      const updatedUser = { ...(pendingUser || {}), ...data.user, mustChangePassword: false };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      showToast('Password changed successfully.', 'success');
      onLogin(updatedUser);
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-container">
        {/* Left Form Section */}
        <section className="auth-card">
          <div className="auth-logo-wrap">
            <img src={logoPreview || defaultLogo} alt="Company logo" className="auth-logo" />
          </div>

          <h2 className="auth-heading">
            {mode === 'login' ? 'Login to your account' : mode === 'signup' ? 'Create an account' : 'Reset Password'}
          </h2>

          {toast && <div className={`auth-toast ${toast.type === 'success' ? 'success' : ''}`}>{toast.message}</div>}

          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <label>
                Login ID / Employee ID / Email
                <input value={loginData.identifier} onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })} required autoComplete="username" />
              </label>
              <label>
                Password
                <div className="password-row">
                  <input type={showPassword ? 'text' : 'password'} value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required autoComplete="current-password" />
                  <EyeButton visible={showPassword} onClick={() => setShowPassword((v) => !v)} />
                </div>
              </label>
              <button className="primary-btn" disabled={loading}>{loading && <Spinner />} SIGN IN</button>
              <button type="button" className="text-link" onClick={() => switchMode('signup')}>Don't have an Account? Sign Up</button>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="auth-form">
              <label>Company Name<input value={signUpData.companyName} onChange={(e) => setSignUpData({ ...signUpData, companyName: e.target.value })} required /></label>
              <label className="upload-box"><span>Upload Company Logo</span><input type="file" accept="image/*" onChange={handleLogoChange} />{logoPreview && <img src={logoPreview} alt="Logo preview" />}</label>
              <label>Employee Name<input value={signUpData.name} onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })} required /></label>
              <label>Email<input type="email" value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} required /></label>
              <label>Phone<input value={signUpData.phone} onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value.replace(/[^\d+]/g, '') })} required /></label>
              <label>Password<div className="password-row"><input type={showPassword ? 'text' : 'password'} value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} required /><EyeButton visible={showPassword} onClick={() => setShowPassword((v) => !v)} /></div></label>
              <label>Confirm Password<div className="password-row"><input type={showConfirmPassword ? 'text' : 'password'} value={signUpData.confirmPassword} onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })} required /><EyeButton visible={showConfirmPassword} onClick={() => setShowConfirmPassword((v) => !v)} /></div></label>
              <button className="primary-btn" disabled={loading}>{loading && <Spinner />} SIGN UP</button>
              <button type="button" className="text-link" onClick={() => switchMode('login')}>Already have an account? Sign In</button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handlePasswordReset} className="auth-form">
              <label>Temporary Password<input type="password" value={resetData.currentPassword} onChange={(e) => setResetData({ ...resetData, currentPassword: e.target.value })} required /></label>
              <label>New Password<input type="password" value={resetData.newPassword} onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })} required /></label>
              <label>Confirm New Password<input type="password" value={resetData.confirmNewPassword} onChange={(e) => setResetData({ ...resetData, confirmNewPassword: e.target.value })} required /></label>
              <button className="primary-btn" disabled={loading}>{loading && <Spinner />} Change Password</button>
            </form>
          )}
        </section>

        {/* Right Animated Carousel Section */}
        <section className="auth-banner">
          {CAROUSEL_SLIDES.map((slide, idx) => (
            <div key={idx} className={`carousel-slide ${idx === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `url(${slide.image})` }}>
              <div className="carousel-overlay" />
              <div className="carousel-content">
                <h3>{slide.title}</h3>
                <p>{slide.description}</p>
              </div>
            </div>
          ))}

          {/* Carousel Pagination Dots */}
          <div className="carousel-dots">
            {CAROUSEL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}