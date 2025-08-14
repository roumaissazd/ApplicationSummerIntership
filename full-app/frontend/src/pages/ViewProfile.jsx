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
    navigate('/register'); // Redirige vers une page d'ajout d'utilisateur
  };

  if (loading) return <div>Chargement du profil...</div>;
  if (error) return <div style={{ color: 'red' }}>Erreur : {error}</div>;
  if (!user) return <div>Utilisateur non trouvé</div>;

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header text-center">
              <h4 className="mb-0">Profil Utilisateur</h4>
            </div>
            <div className="card-body text-center">
              <img
                src={user.faceIdPhoto ? `http://localhost:5001${user.faceIdPhoto}` : '/default-avatar.png'}
                alt="Avatar"
                className="rounded-circle mb-3"
                style={{ width: 120, height: 120, objectFit: 'cover' }}
              />
              <div className="text-start">
                <p><strong>Prénom :</strong> {user.firstName}</p>
                <p><strong>Nom :</strong> {user.lastName}</p>
                <p><strong>Email :</strong> {user.email}</p>
                <p>
                  <strong>Rôle :</strong>{' '}
                  <span className={`badge ms-2 ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                    {user.role}
                  </span>
                </p>
              </div>
              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-outline-primary" onClick={handleEdit}>
                  ✏️ Modifier le profil
                </button>
                {user.role === 'admin' && (
                  <button className="btn btn-outline-success" onClick={handleAddUser}>
                    ➕ Ajouter un utilisateur
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
