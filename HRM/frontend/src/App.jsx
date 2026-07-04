import React, { useEffect, useMemo, useState } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import Profile from './pages/Profile';

function App() {
  useEffect(() => {
    if (window.location.hostname === 'localhost') {
      window.location.replace(window.location.href.replace('localhost', '127.0.0.1'));
    }
  }, []);

  const savedUser = useMemo(() => {
    const rawUser = localStorage.getItem('userInfo');
    return rawUser ? JSON.parse(rawUser) : null;
  }, []);

  const [user, setUser] = useState(savedUser);
  const [view, setView] = useState('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
    setSelectedEmployee(null);
    setView('dashboard');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (view === 'profile') {
    return (
      <Profile
        currentUser={user}
        employee={selectedEmployee}
        onBack={() => setView('dashboard')}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <Dashboard
      currentUser={user}
      userRole={user.role}
      onLogout={handleLogout}
      onOpenProfile={(employee = null) => {
        setSelectedEmployee(employee);
        setView('profile');
      }}
      onSelectEmployee={(employee) => {
        setSelectedEmployee(employee);
        setView('profile');
      }}
    />
  );
}

export default App;
