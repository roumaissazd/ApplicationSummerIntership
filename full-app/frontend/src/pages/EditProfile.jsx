import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../assets/vendor/css/pages/page-auth.css';

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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/users/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        const { firstName, lastName, email, faceIdPhoto } = res.data.user;
        setFormData(prev => ({ ...prev, firstName, lastName, email }));

        // Construction de l’URL absolue vers l’image si elle existe
        if (faceIdPhoto) {
          setPreviewPhoto(`http://localhost:5001/${faceIdPhoto.replace(/^\/+/, '')}`);
        } else {
          setPreviewPhoto('/default-avatar.png');
        }
      } catch {
        setError('Erreur lors du chargement du profil.');
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
      setMessage('Profil mis à jour avec succès');
      setError('');
      navigate('/profile');
    } catch {
      setError('Erreur lors de la mise à jour du profil');
      setMessage('');
    }
  };

  return (
    <div className="authentication-wrapper authentication-basic container-p-y">
      <div className="authentication-inner">
        <div className="card">
          <div className="card-body">
            <h4 className="mb-4 text-center">Modifier le profil</h4>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {previewPhoto && (
              <div className="mb-3 text-center">
                <img
                  src={previewPhoto}
                  alt="Profil actuel"
                  style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%' }}
                  className="mb-2"
                />
              </div>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">Prénom</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">Nom</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">E-mail</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="faceIdPhoto" className="form-label">Photo de Face ID</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">Mettre à jour</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
