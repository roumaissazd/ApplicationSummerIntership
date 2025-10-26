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
        setIsFirstAdmin(false); // Ou true selon ta politique
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
      alert('All fields are required');
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
    return <div className="text-center mt-5">Checking admin status...</div>;
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="text-center mb-4">
        {isFirstAdmin ? 'Create Initial Admin 👑' : 'Create New Admin 👤'}
      </h2>

      {message && (
        <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="firstName" className="form-label">First Name</label>
          <input
            type="text"
            name="firstName"
            className="form-control"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="lastName" className="form-label">Last Name</label>
          <input
            type="text"
            name="lastName"
            className="form-control"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          {isFirstAdmin ? 'Create Initial Admin' : 'Create Admin'}
        </button>
      </form>
    </div>
  );
};

export default CreateAdmin;
