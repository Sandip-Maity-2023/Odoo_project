import React, { useEffect, useMemo, useState } from 'react';
import logo from '../assets/odoo_img.png';

const avatarFor = (name) => `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name || 'Employee')}`;
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const API_URL = import.meta.env.VITE_API_URL || '';
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` });

const resumeFields = ['About Me', 'Work Experience', 'Education', 'Projects', 'Skills', 'Certifications', 'Languages', 'Interests & Hobbies'];
const privateFields = ['Date of Birth', 'Gender', 'Marital Status', 'Nationality', 'Personal Email', 'Residential Address', 'Date of Joining', 'Employee Code', 'Bank Name', 'Account Number', 'IFSC Code', 'PAN Number', 'UAN Number'];

const defaultSalaryConfig = {
  wageType: 'Fixed Wage',
  monthlyWage: 50000,
  workingDays: 5,
  breakHours: 1,
  basicPercent: 50,
  hraPercentOfBasic: 50,
  standardPercent: 8.334,
  performancePercent: 4.165,
  ltaPercent: 4.165,
  pfPercent: 12,
  professionalTax: 200,
};

function calculateSalary(config) {
  const monthly = Number(config.monthlyWage) || 0;
  const basic = monthly * (Number(config.basicPercent) || 0) / 100;
  const hra = basic * (Number(config.hraPercentOfBasic) || 0) / 100;
  const standard = monthly * (Number(config.standardPercent) || 0) / 100;
  const performance = monthly * (Number(config.performancePercent) || 0) / 100;
  const lta = monthly * (Number(config.ltaPercent) || 0) / 100;
  const fixed = monthly - basic - hra - standard - performance - lta;
  const pf = basic * (Number(config.pfPercent) || 0) / 100;
  const gross = basic + hra + standard + performance + lta + fixed;
  const net = gross - (Number(config.professionalTax) || 0) - pf;

  return {
    monthly,
    yearly: monthly * 12,
    components: [
      ['Basic Salary', basic, `${config.basicPercent}% of monthly wage`],
      ['House Rent Allowance', hra, `${config.hraPercentOfBasic}% of Basic`],
      ['Standard Allowance', standard, `${config.standardPercent}% of monthly wage`],
      ['Performance Bonus', performance, `${config.performancePercent}% of monthly wage`],
      ['Leave Travel Allowance', lta, `${config.ltaPercent}% of monthly wage`],
      ['Fixed Allowance', fixed, 'Remaining balance'],
    ],
    pf,
    gross,
    net,
  };
}

function FieldGrid({ fields, values, onChange, editable, textarea = false }) {
  return (
    <div className="ems-profile-grid">
      {fields.map((field) => (
        <label key={field}>
          <span>{field}</span>
          {textarea ? (
            <textarea value={values[field] || ''} onChange={(event) => onChange(field, event.target.value)} disabled={!editable} />
          ) : (
            <input value={values[field] || ''} onChange={(event) => onChange(field, event.target.value)} disabled={!editable} />
          )}
        </label>
      ))}
    </div>
  );
}

function SalaryTab({ config, setConfig }) {
  const salary = useMemo(() => calculateSalary(config), [config]);
  const update = (key, value) => setConfig((current) => ({ ...current, [key]: value }));

  return (
    <div className="ems-salary-layout">
      <section className="ems-card">
        <h2>Salary Configuration</h2>
        <div className="ems-form-grid">
          <label>Wage Type<select value={config.wageType} onChange={(event) => update('wageType', event.target.value)}><option>Fixed Wage</option></select></label>
          <label>Monthly Wage<input type="number" value={config.monthlyWage} onChange={(event) => update('monthlyWage', event.target.value)} /></label>
          <label>Working Days per Week<input type="number" value={config.workingDays} onChange={(event) => update('workingDays', event.target.value)} /></label>
          <label>Break Hours<input type="number" value={config.breakHours} onChange={(event) => update('breakHours', event.target.value)} /></label>
          <label>Basic %<input type="number" value={config.basicPercent} onChange={(event) => update('basicPercent', event.target.value)} /></label>
          <label>HRA % of Basic<input type="number" value={config.hraPercentOfBasic} onChange={(event) => update('hraPercentOfBasic', event.target.value)} /></label>
          <label>Standard %<input type="number" value={config.standardPercent} onChange={(event) => update('standardPercent', event.target.value)} /></label>
          <label>Performance %<input type="number" value={config.performancePercent} onChange={(event) => update('performancePercent', event.target.value)} /></label>
          <label>LTA %<input type="number" value={config.ltaPercent} onChange={(event) => update('ltaPercent', event.target.value)} /></label>
          <label>PF %<input type="number" value={config.pfPercent} onChange={(event) => update('pfPercent', event.target.value)} /></label>
          <label>Professional Tax<input type="number" value={config.professionalTax} onChange={(event) => update('professionalTax', event.target.value)} /></label>
        </div>
      </section>

      <section className="ems-card">
        <h2>Salary Information</h2>
        <div className="ems-pay-summary">
          <div><span>Monthly Wage</span><strong>{currency.format(salary.monthly)}</strong></div>
          <div><span>Yearly Wage</span><strong>{currency.format(salary.yearly)}</strong></div>
          <div><span>Net Monthly</span><strong>{currency.format(salary.net)}</strong></div>
        </div>
        <div className="ems-table-wrap">
          <table className="ems-table">
            <thead><tr><th>Component</th><th>Amount</th><th>Formula</th></tr></thead>
            <tbody>
              {salary.components.map(([name, amount, formula]) => <tr key={name}><td>{name}</td><td>{currency.format(amount)}</td><td>{formula}</td></tr>)}
              <tr><td>Gross Salary</td><td>{currency.format(salary.gross)}</td><td>Total equals monthly wage</td></tr>
              <tr><td>Employee PF</td><td>{currency.format(salary.pf)}</td><td>{config.pfPercent}% of Basic</td></tr>
              <tr><td>Employer PF</td><td>{currency.format(salary.pf)}</td><td>{config.pfPercent}% of Basic</td></tr>
              <tr><td>Professional Tax</td><td>{currency.format(config.professionalTax)}</td><td>Monthly deduction</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function Profile({ currentUser = {}, employee = null, onBack, onLogout }) {
  const profile = employee || {
    name: currentUser.name || 'My Profile',
    employeeId: currentUser.employeeId || currentUser.loginId || 'EMP-001',
    jobPosition: currentUser.role || 'Employee',
    department: 'General',
    email: currentUser.email || 'employee@company.com',
    mobile: currentUser.phone || '+91 00000 00000',
    company: 'Odoo India',
    manager: 'Manager',
    location: 'Office',
    avatar: avatarFor(currentUser.name),
  };

  const isAdmin = currentUser.role === 'Admin';
  const isPeopleTeam = currentUser.role === 'Admin' || currentUser.role === 'HR';
  const isOwner = profile.employeeId === (currentUser.employeeId || currentUser.loginId);
  const canEditProfile = isPeopleTeam || isOwner;
  const [activeTab, setActiveTab] = useState('Resume');
  const [toast, setToast] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || avatarFor(profile.name));
  const [resume, setResume] = useState(Object.fromEntries(resumeFields.map((field) => [field, ''])));
  const [privateInfo, setPrivateInfo] = useState({
    'Date of Birth': '18-06-2004',
    Gender: 'Male',
    'Marital Status': 'Single',
    Nationality: 'Indian',
    'Personal Email': 'personal@example.com',
    'Residential Address': 'Kolkata, West Bengal',
    'Date of Joining': '01-06-2026',
    'Employee Code': profile.employeeId,
    'Bank Name': 'State Bank of India',
    'Account Number': 'XXXXXXXX5432',
    'IFSC Code': 'SBIN0001234',
    'PAN Number': 'ABCDE1234F',
    'UAN Number': '100XXXXXXXXX',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [salaryConfig, setSalaryConfig] = useState(defaultSalaryConfig);
  const targetId = profile.id || currentUser.id || 'me';

  const tabs = ['Resume', 'Private Information', 'Security', ...(isAdmin ? ['Salary Information'] : [])];
  const updateResume = (key, value) => setResume((current) => ({ ...current, [key]: value }));
  const updatePrivate = (key, value) => setPrivateInfo((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (profile.resume) setResume((current) => ({ ...current, ...profile.resume }));
    if (profile.privateInfo) setPrivateInfo((current) => ({ ...current, ...profile.privateInfo }));
    if (profile.avatar) setAvatarPreview(profile.avatar);
  }, [profile.avatar, profile.privateInfo, profile.resume]);

  const handleAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 1024 * 1024) {
      setToast('Please upload an image under 1MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setAvatarPreview(dataUrl);
      setToast('Profile picture preview updated.');
    };
    reader.readAsDataURL(file);
  };

  const save = async (payload, successMessage) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/employees/${targetId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to save profile changes');
      if (String(targetId) === String(currentUser.id) || targetId === 'me') {
        const updatedUser = { ...currentUser, ...data.user };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
      setToast(successMessage);
    } catch (error) {
      setToast(error.message);
    }
  };

  const avatarPayload = () => {
    if (!avatarPreview?.startsWith('data:')) return null;
    const [meta, data] = avatarPreview.split(',');
    return { mimeType: meta.match(/data:(.*);base64/)?.[1] || 'image/png', data, fileName: 'profile-photo' };
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return setToast('New password and confirm password must match.');
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to update password');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setToast('Password updated successfully.');
    } catch (error) {
      setToast(error.message);
    }
  };

  return (
    <div className="ems-shell">
      <header className="ems-topbar">
        <div className="ems-brand">
          <button className="ems-back" onClick={onBack}>Back</button>
          <img src={logo} alt="Company Logo" />
          <nav><button className="active">Profile</button></nav>
        </div>
        <button className="ems-secondary" onClick={onLogout}>Logout</button>
      </header>

      <main className="ems-page">
        {toast && <div className="ems-toast success">{toast}</div>}
        <section className="ems-profile-header ems-card">
          <div className="ems-photo-wrap">
            <img src={avatarPreview} alt={profile.name} />
            {canEditProfile && <label className="ems-upload-mini">Edit Picture<input type="file" accept="image/*" onChange={handleAvatar} /></label>}
          </div>
          <div>
            <h1>{profile.name}</h1>
            <p>{profile.jobPosition || 'Employee'}</p>
            <div className="ems-profile-facts">
              <span>Login ID: {profile.employeeId}</span>
              <span>Email: {profile.email}</span>
              <span>Mobile: {profile.mobile}</span>
              <span>Company: {profile.company || 'Odoo India'}</span>
              <span>Department: {profile.department || 'General'}</span>
              <span>Manager: {profile.manager || 'Manager'}</span>
              <span>Location: {profile.location || 'Office'}</span>
            </div>
          </div>
        </section>

        <section className="ems-card">
          <div className="ems-tabs">
            {tabs.map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}
          </div>

          {activeTab === 'Resume' && (
            <>
              <FieldGrid fields={resumeFields} values={resume} onChange={updateResume} editable={canEditProfile} textarea />
              {canEditProfile && <button className="ems-primary" onClick={() => save({ resume, avatar: avatarPayload() }, 'Resume saved successfully.')}>Save Resume</button>}
            </>
          )}

          {activeTab === 'Private Information' && (
            <>
              <FieldGrid fields={privateFields} values={privateInfo} onChange={updatePrivate} editable={canEditProfile} />
              {canEditProfile && <button className="ems-primary" onClick={() => save({ privateInfo, avatar: avatarPayload() }, 'Private information saved successfully.')}>Save Private Information</button>}
            </>
          )}

          {activeTab === 'Security' && (
            <div className="ems-security-layout">
              <form className="ems-card subtle" onSubmit={changePassword}>
                <h2>Change Password</h2>
                <label>Current Password<input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} required /></label>
                <label>New Password<input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} required /></label>
                <label>Confirm Password<input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} required /></label>
                <button className="ems-primary">Update Password</button>
              </form>
              <div className="ems-card subtle">
                <h2>Account Security</h2>
                <p>Two-Factor Authentication: Optional</p>
                <p>Last Login: Today, 09:30 AM</p>
                <p>Active Sessions: Current browser session</p>
              </div>
            </div>
          )}

          {activeTab === 'Salary Information' && isAdmin && <SalaryTab config={salaryConfig} setConfig={setSalaryConfig} />}
        </section>
      </main>
    </div>
  );
}
