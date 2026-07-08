// frontend/src/components/ProfileSection.jsx
import React, { useState } from 'react';

export default function ProfileSection({ user, onProfileUpdated }) {
  // Local states holding input text fields
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || user?.first_name || '',
    lastName: user?.profile?.lastName || user?.last_name || '',
    phone: user?.profile?.phone || user?.phone || '',
    address: user?.profile?.address || '',
    location: user?.profile?.location || '',
    department: user?.profile?.department || '',
    jobPosition: user?.profile?.jobPosition || '',
    manager: user?.profile?.manager || '',
  });

  // Local states holding file streams from input tags
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Package everything cleanly as Multipart Form Data
    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      dataToSend.append(key, formData[key]);
    });

    if (avatarFile) dataToSend.append('avatarFile', avatarFile);
    if (resumeFile) dataToSend.append('resumeFile', resumeFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/update', { 
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
          // CRITICAL: Do NOT explicitly type Content-Type headers here.
        },
        body: dataToSend
      });

      const result = await response.json();
      if (result.success) {
        alert('Profile saved cleanly into MongoDB!');
        // Trigger a callback to update user data in the layout root state (Dashboard)
        if (onProfileUpdated) onProfileUpdated(result.profile);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <form onSubmit={handleSave} className="profile-form">
      {/* Example input bindings */}
      <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="First Name"/>
      
      {/* File inputs */}
      <label>Change Avatar Picture:</label>
      <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files[0])} />

      <label>Upload/Replace Resume Document:</label>
      <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])} />

      <button type="submit">Save Changes</button>
    </form>
  );
}