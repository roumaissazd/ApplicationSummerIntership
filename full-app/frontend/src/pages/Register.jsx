import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const nameRegex = /^[A-Z][a-zA-Z]*$/;
    const emailRegex = /^\S+@\S+\.\S+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    } else if (!nameRegex.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name must start with a capital letter and contain only letters.';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required.';
    } else if (!nameRegex.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name must start with a capital letter and contain only letters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters and include uppercase, lowercase, number, and special character.';
    }

    if (!formData.terms) {
      newErrors.terms = 'You must accept the terms and conditions.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        setMessage('✅ Registration successful!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'user',
          terms: false,
          faceIdPhoto: null,
        });
        setTimeout(() => navigate('/home'), 2000);
      } else {
        setMessage(dataResponse.error || dataResponse.message || '❌ Registration failed.');
      }
    } catch (err) {
      setMessage('❌ Server error.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 via-accent-pink/20 to-accent-blue/20"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent-purple rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-accent-pink rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-accent-blue rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '4s' }}></div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <h1 className="text-6xl font-bold text-white font-sans mb-6 animate-gradient bg-gradient-to-r from-white via-accent-purple to-accent-pink bg-clip-text text-transparent">
            Join Us
          </h1>
          <p className="text-xl text-text-secondary font-sans mb-8 max-w-md">
            Create your account and start monitoring your enterprise infrastructure with advanced analytics and real-time insights
          </p>
          <div className="flex space-x-4">
            <div className="w-3 h-3 bg-accent-purple rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-accent-pink rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary font-sans mb-2">Create Account</h2>
            <p className="text-text-secondary font-sans">Fill in your information to get started</p>
          </div>

          {/* Form Card */}
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-8">
            {message && (
              <div className={`p-4 rounded-lg mb-6 ${
                message.startsWith('✅') ? 'bg-accent-green/10 border border-accent-green/20' : 'bg-accent-red/10 border border-accent-red/20'
              }`}>
                <p className={`font-sans text-sm ${
                  message.startsWith('✅') ? 'text-accent-green' : 'text-accent-red'
                }`}>
                  {message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-text-primary font-sans mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className={`w-full px-4 py-3 bg-dark-secondary/50 border rounded-lg focus:ring-2 focus:ring-accent-purple focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans ${
                      errors.firstName ? 'border-accent-red' : 'border-glass-border'
                    }`}
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                  {errors.firstName && <p className="text-accent-red text-xs font-sans mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-text-primary font-sans mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className={`w-full px-4 py-3 bg-dark-secondary/50 border rounded-lg focus:ring-2 focus:ring-accent-purple focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans ${
                      errors.lastName ? 'border-accent-red' : 'border-glass-border'
                    }`}
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                  {errors.lastName && <p className="text-accent-red text-xs font-sans mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary font-sans mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`w-full px-4 py-3 bg-dark-secondary/50 border rounded-lg focus:ring-2 focus:ring-accent-purple focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans ${
                    errors.email ? 'border-accent-red' : 'border-glass-border'
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
                {errors.email && <p className="text-accent-red text-xs font-sans mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary font-sans mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`w-full px-4 py-3 bg-dark-secondary/50 border rounded-lg focus:ring-2 focus:ring-accent-purple focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans ${
                    errors.password ? 'border-accent-red' : 'border-glass-border'
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create secure password"
                  required
                />
                {errors.password && <p className="text-accent-red text-xs font-sans mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-text-primary font-sans mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-purple focus:border-transparent transition-all duration-300 text-text-primary font-sans"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label htmlFor="faceIdPhoto" className="block text-sm font-medium text-text-primary font-sans mb-2">
                  Profile Picture (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="faceIdPhoto"
                    name="faceIdPhoto"
                    className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-purple focus:border-transparent transition-all duration-300 text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-purple file:text-white hover:file:bg-accent-pink font-sans"
                    onChange={handleChange}
                    accept="image/*"
                  />
                </div>
                <p className="text-xs text-text-secondary font-sans mt-1">
                  Upload a profile picture for better identification
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  className="mt-1 w-4 h-4 text-accent-purple bg-dark-secondary/50 border-glass-border rounded focus:ring-accent-purple focus:ring-2"
                  checked={formData.terms}
                  onChange={handleChange}
                  required
                />
                <div>
                  <label htmlFor="terms" className="text-sm text-text-primary font-sans cursor-pointer">
                    I agree to the{' '}
                    <button type="button" className="text-accent-purple hover:text-accent-pink transition-colors duration-300 underline">
                      privacy policy & terms
                    </button>
                  </label>
                  {errors.terms && <p className="text-accent-red text-xs font-sans mt-1">{errors.terms}</p>}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold py-3 px-4 rounded-lg hover:from-accent-pink hover:to-accent-purple transition-all duration-300 font-sans hover:shadow-glow"
              >
                Create Account
              </button>
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <p className="text-text-secondary font-sans text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-accent-purple hover:text-accent-pink transition-colors duration-300 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;