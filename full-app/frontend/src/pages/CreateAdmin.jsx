import React, { useState, useEffect } from 'react';

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [isFirstAdmin, setIsFirstAdmin] = useState(null); // null = loading

  useEffect(() => {
    const checkExistingAdmin = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/users/admin/exists');
        if (!res.ok) throw new Error('Failed to fetch admin status');
        const data = await res.json();
        setIsFirstAdmin(!data.adminExists);
      } catch (err) {
        setMessage('❌ Server error while checking admin status');
        setIsFirstAdmin(false);
      }
    };

    checkExistingAdmin();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setMessage('❌ All fields are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const endpoint = isFirstAdmin
        ? 'http://localhost:5001/api/users/admin/init'
        : 'http://localhost:5001/api/users/admin/create';

      const token = localStorage.getItem('token');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isFirstAdmin ? {} : { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
        });
      } else {
        setMessage(`❌ ${data.error || 'An error occurred'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Server error');
    }
  };

  if (isFirstAdmin === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-primary font-sans">Checking admin status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary font-sans mb-4">
            {isFirstAdmin ? '👑 Create Initial Admin' : '👤 Create New Admin'}
          </h1>
          <p className="text-text-secondary font-sans">
            {isFirstAdmin ? 'Set up the first administrator account' : 'Add a new administrator to the system'}
          </p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-text-primary font-sans mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-text-primary font-sans mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary font-sans mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary font-sans mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter secure password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold py-3 px-4 rounded-lg hover:from-accent-purple hover:to-accent-pink transition-all duration-300 font-sans hover:shadow-glow"
            >
              {isFirstAdmin ? 'Create Initial Admin' : 'Create Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;
