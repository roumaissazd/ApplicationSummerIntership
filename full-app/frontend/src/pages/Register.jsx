import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/vendor/css/pages/page-auth.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    terms: false,
    faceIdPhoto: null,
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
  };

  const validate = () => {
    const nameRegex = /^[A-Z][a-zA-Z]*$/;
    const emailRegex = /^\S+@\S+\.\S+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;

    if (!formData.firstName.trim()) {
      alert('First name is required.');
      return false;
    }
    if (!nameRegex.test(formData.firstName.trim())) {
      alert('First name must start with a capital letter and contain only letters.');
      return false;
    }

    if (!formData.lastName.trim()) {
      alert('Last name is required.');
      return false;
    }
    if (!nameRegex.test(formData.lastName.trim())) {
      alert('Last name must start with a capital letter and contain only letters.');
      return false;
    }

    if (!formData.email.trim()) {
      alert('Email is required.');
      return false;
    }
    if (!emailRegex.test(formData.email.trim())) {
      alert('Please enter a valid email address.');
      return false;
    }

    if (!formData.password) {
      alert('Password is required.');
      return false;
    }
    if (!passwordRegex.test(formData.password)) {
      alert('Password must be at least 6 characters and include uppercase, lowercase, number, and special character.');
      return false;
    }

    if (!formData.terms) {
      alert('You must accept the terms and conditions.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const data = new FormData();
    data.append('firstName', formData.firstName.trim());
    data.append('lastName', formData.lastName.trim());
    data.append('email', formData.email.trim());
    data.append('password', formData.password);
    data.append('role', formData.role);
    if (formData.faceIdPhoto) {
      data.append('faceIdPhoto', formData.faceIdPhoto);
    }

    try {
      const res = await fetch('http://localhost:5001/api/users/register', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Ensure admin is authenticated
        },
        body: data,
      });

      const dataResponse = await res.json();

      if (res.ok) {
        alert('✅ Registration successful!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'user',
          terms: false,
          faceIdPhoto: null,
        });
        setMessage('');
        navigate('/home');
      } else {
        alert(dataResponse.error || dataResponse.message || '❌ Registration failed.');
      }
    } catch (err) {
      alert('❌ Server error.');
      console.error(err);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: 'url("/uploads/Capgemini-Logo.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{ maxWidth: '450px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
      >
        <div className="text-center mb-4">{/* Logo spot */}</div>

        <h4 className="text-center fw-semibold">Create Your Account 📝</h4>

        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} text-center`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate encType="multipart/form-data">
          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="role" className="form-label">Role</label>
            <select
              className="form-select"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="faceIdPhoto" className="form-label">Face ID Photo (Optional)</label>
            <input
              type="file"
              className="form-control"
              id="faceIdPhoto"
              name="faceIdPhoto"
              onChange={handleChange}
              accept="image/*"
            />
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="terms"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              required
            />
            <label className="form-check-label" htmlFor="terms">
              I agree to{' '}
              <button type="button" className="btn btn-link p-0 text-primary align-baseline">
                privacy policy & terms
              </button>
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100">Sign up</button>
        </form>

        <p className="text-center mt-3 text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary text-decoration-none">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;