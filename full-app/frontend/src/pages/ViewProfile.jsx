import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ViewProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Erreur lors du chargement du profil');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
    else {
      setError('Utilisateur non authentifié');
      setLoading(false);
    }
  }, [token]);

  const handleEdit = () => {
    navigate('/edit-profile');
  };

  const handleAddUser = () => {
    navigate('/register');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-primary font-sans">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="text-center">
          <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-8 max-w-md">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-accent-red font-sans mb-2">Error</h2>
            <p className="text-text-secondary font-sans">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="text-center">
          <div className="bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg p-8 max-w-md">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-xl font-bold text-accent-yellow font-sans mb-2">User Not Found</h2>
            <p className="text-text-secondary font-sans">Unable to load user profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary font-sans mb-4">User Profile</h1>
          <p className="text-text-secondary font-sans">View and manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-8">
              <div className="text-center mb-8">
                <div className="relative inline-block mb-6">
                  <img
                    src={user.faceIdPhoto ? `http://localhost:5001${user.faceIdPhoto}` : '/default-avatar.png'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-accent-blue/20 shadow-glow"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-text-primary font-sans mb-2">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-text-secondary font-sans">{user.email}</p>
              </div>

              {/* Profile Details */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-dark-secondary/50 rounded-lg p-4">
                    <div className="text-sm text-text-secondary font-sans mb-1">First Name</div>
                    <div className="text-lg font-semibold text-text-primary font-sans">{user.firstName}</div>
                  </div>
                  <div className="bg-dark-secondary/50 rounded-lg p-4">
                    <div className="text-sm text-text-secondary font-sans mb-1">Last Name</div>
                    <div className="text-lg font-semibold text-text-primary font-sans">{user.lastName}</div>
                  </div>
                </div>

                <div className="bg-dark-secondary/50 rounded-lg p-4">
                  <div className="text-sm text-text-secondary font-sans mb-1">Email Address</div>
                  <div className="text-lg font-semibold text-text-primary font-sans">{user.email}</div>
                </div>

                <div className="bg-dark-secondary/50 rounded-lg p-4">
                  <div className="text-sm text-text-secondary font-sans mb-1">Role</div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold font-sans capitalize ${
                      user.role === 'admin'
                        ? 'bg-accent-red/20 text-accent-red'
                        : 'bg-accent-blue/20 text-accent-blue'
                    }`}>
                      {user.role}
                    </span>
                    {user.role === 'admin' && <span className="text-lg">👑</span>}
                  </div>
                </div>

                <div className="bg-dark-secondary/50 rounded-lg p-4">
                  <div className="text-sm text-text-secondary font-sans mb-1">Member Since</div>
                  <div className="text-lg font-semibold text-text-primary font-mono">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="space-y-6">
            <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6">
              <h3 className="text-xl font-bold text-text-primary font-sans mb-6">Actions</h3>
              <div className="space-y-4">
                <button
                  onClick={handleEdit}
                  className="w-full bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold py-3 px-4 rounded-lg hover:from-accent-purple hover:to-accent-pink transition-all duration-300 font-sans hover:shadow-glow flex items-center justify-center space-x-2"
                >
                  <span>✏️</span>
                  <span>Edit Profile</span>
                </button>

                {user.role === 'admin' && (
                  <button
                    onClick={handleAddUser}
                    className="w-full bg-gradient-to-r from-accent-green to-accent-blue text-white font-semibold py-3 px-4 rounded-lg hover:from-accent-blue hover:to-accent-purple transition-all duration-300 font-sans hover:shadow-glow flex items-center justify-center space-x-2"
                  >
                    <span>➕</span>
                    <span>Add User</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6">
              <h3 className="text-xl font-bold text-text-primary font-sans mb-6">Account Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary font-sans">Status</span>
                  <span className="text-accent-green font-semibold font-sans">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary font-sans">Last Login</span>
                  <span className="text-text-primary font-mono text-sm">Today</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary font-sans">Profile Completion</span>
                  <span className="text-accent-green font-semibold font-sans">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
