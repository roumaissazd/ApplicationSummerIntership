import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/home'; // ✅ Import Home
import CreateAdmin from './pages/CreateAdmin';
import Navbar from './pages/navbar';
import ViewProfile from './pages/ViewProfile';
import EditProfile from './pages/EditProfile';
import UsersTable from './pages/UsersTable';
import Dashboard from './pages/dashboard';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
        <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} /> {/* ✅ Add Home route */}
        <Route path="/create-admin" element={<CreateAdmin />} />
        <Route path="/profile" element={<ViewProfile />} />
  <Route path="/edit-profile" element={<EditProfile />} /> 
<Route path="/users" element={<UsersTable />} />
<Route path="/dashboard" element={<Dashboard />} />

<Route path="/dashboard/:id" element={<Dashboard />} />
<Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
    </Router>
  );
}

export default App;


