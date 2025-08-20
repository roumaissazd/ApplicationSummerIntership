import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const location = useLocation();

  // Vérifie si un resetToken est présent dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetToken = params.get('resetToken');
    if (resetToken) setShowResetModal(true);
  }, [location]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) return setError(data.error || 'Erreur de connexion');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/home';
    } catch {
      setError('Impossible de se connecter au serveur.');
    }
  };

  // Mot de passe oublié
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setError('Veuillez saisir une adresse email valide');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Erreur lors de la demande de réinitialisation');
        return;
      }

      setForgotMessage('✅ Code envoyé par email ! Vérifiez votre boîte de réception.');
      setShowForgotModal(false);
      setShowResetModal(true);
    } catch (error) {
      setError(`⚠️ Erreur serveur : ${error.message}`);
    }
  };

  // Réinitialisation mot de passe avec code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/users/reset-password-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          code: resetCode,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Erreur lors de la réinitialisation');
        return;
      }

      setResetMessage(data.message);
      setNewPassword('');
      setConfirmPassword('');
      setResetCode('');
      setShowResetModal(false);
    } catch (error) {
      setError(`⚠️ Erreur serveur : ${error.message}`);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: 'url("/Uploads/Capgemini-Logo.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="card shadow-lg p-4" style={{ maxWidth: '450px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <h4 className="text-center fw-semibold mb-4">Connexion 🔐</h4>
        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Entrez votre email"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Se connecter</button>
        </form>

        <div className="text-center mt-3">
          <button
            className="btn btn-link text-decoration-none"
            onClick={() => setShowForgotModal(true)}
          >
            Mot de passe oublié ?
          </button>
        </div>

        <p className="text-center mt-3 text-muted">
          Pas encore de compte ?{' '}
          <a href="/register" className="text-primary text-decoration-none">
            Créer un compte
          </a>
        </p>
      </div>

      {/* Pop-up Mot de passe oublié */}
      {showForgotModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Mot de passe oublié 🔑</h5>
                <button type="button" className="btn-close" onClick={() => setShowForgotModal(false)}></button>
              </div>
              <div className="modal-body">
                {forgotMessage && <div className="alert alert-success">{forgotMessage}</div>}
                <form onSubmit={handleForgotPassword} noValidate>
                  <div className="mb-3">
                    <label htmlFor="forgotEmail" className="form-label">Email</label>
                    <input
                      type="email"
                      id="forgotEmail"
                      className="form-control"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Entrez votre email"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-warning w-100">
                    Envoyer le code
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Réinitialisation mot de passe avec code */}
      {showResetModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Réinitialiser le mot de passe 🔑</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowResetModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {resetMessage && <div className="alert alert-success">{resetMessage}</div>}
                <form onSubmit={handleResetPassword} noValidate>
                  <div className="mb-3">
                    <label htmlFor="resetCode" className="form-label">Code reçu par email</label>
                    <input
                      type="text"
                      id="resetCode"
                      className="form-control"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">Nouveau mot de passe</label>
                    <input
                      type="password"
                      id="newPassword"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirmer mot de passe</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Réinitialiser</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
