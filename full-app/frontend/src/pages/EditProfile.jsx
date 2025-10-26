import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    faceIdPhoto: null,
  });
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/users/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        const { firstName, lastName, email, faceIdPhoto } = res.data.user;
        setFormData(prev => ({ ...prev, firstName, lastName, email }));

        // Construction de l'URL absolue vers l'image si elle existe
        if (faceIdPhoto) {
          setPreviewPhoto(`http://localhost:5001/${faceIdPhoto.replace(/^\/+/, '')}`);
        } else {
          setPreviewPhoto('/default-avatar.png');
        }
      } catch {
        setError('Erreur lors du chargement du profil.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, faceIdPhoto: file }));
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');

    const data = new FormData();
    data.append('firstName', formData.firstName);
    data.append('lastName', formData.lastName);
    data.append('email', formData.email);
    if (formData.faceIdPhoto instanceof File) {
      data.append('faceIdPhoto', formData.faceIdPhoto);
    }

    try {
      await axios.put('http://localhost:5001/api/users/profile', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('✅ Profil mis à jour avec succès');
      setTimeout(() => navigate('/profile'), 2000);
    } catch {
      setError('❌ Erreur lors de la mise à jour du profil');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-primary font-sans">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary font-sans mb-4">Edit Profile</h1>
          <p className="text-text-secondary font-sans">Update your personal information and profile picture</p>
        </div>

        {/* Form Card */}
        <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-8">
          {/* Avatar Preview */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <img
                src={previewPhoto}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-accent-blue/20 shadow-glow"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center">
                <span className="text-white text-sm">📷</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="bg-accent-green/10 border border-accent-green/20 rounded-lg p-4 mb-6">
              <p className="text-accent-green font-sans text-sm">{message}</p>
            </div>
          )}
          {error && (
            <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 mb-6">
              <p className="text-accent-red font-sans text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-text-primary font-sans mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans"
                  name="firstName"
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
                  className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans"
                  name="lastName"
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
                className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label htmlFor="faceIdPhoto" className="block text-sm font-medium text-text-primary font-sans mb-2">
                Profile Picture
              </label>
              <div className="relative">
                <input
                  type="file"
                  className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-blue file:text-white hover:file:bg-accent-purple font-sans"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
              <p className="text-xs text-text-secondary font-sans mt-1">
                Upload a new profile picture (optional)
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold py-3 px-4 rounded-lg hover:from-accent-purple hover:to-accent-pink transition-all duration-300 font-sans hover:shadow-glow"
              >
                Update Profile
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-6 py-3 bg-dark-secondary/50 border border-glass-border text-text-primary font-semibold rounded-lg hover:bg-dark-secondary hover:shadow-glow transition-all duration-300 font-sans"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
