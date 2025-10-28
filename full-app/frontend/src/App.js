import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/home';
import CreateAdmin from './pages/CreateAdmin';
import Navbar from './pages/navbar';
import ViewProfile from './pages/ViewProfile';
import EditProfile from './pages/EditProfile';
import UsersTable from './pages/UsersTable';
import Dashboard from './pages/dashboard';
import ResetPassword from './pages/ResetPassword';
import AssignmentCalendar from './pages/AssignmentCalendar';
import ChatPage from './pages/ChatPage';
import RiskPage from './pages/RiskPage';

function App() {
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // Simulate loading time for smooth transitions
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-primary font-sans">Loading Capgemini Monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary">
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <div className="pt-20 transition-opacity duration-500 ease-in-out">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/create-admin" element={<CreateAdmin />} />
            <Route path="/profile" element={<ViewProfile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/users" element={<UsersTable />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:id" element={<Dashboard />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/assignment-calendar" element={<AssignmentCalendar />} />
            <Route path="/dashboard/:machineId" element={<Dashboard />} />
               <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
<Route path="/risks" element={<RiskPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;


