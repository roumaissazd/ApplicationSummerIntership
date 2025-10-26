import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const [faceLoginLoading, setFaceLoginLoading] = useState(false);
  const [showFaceIdModal, setShowFaceIdModal] = useState(false);
  const videoRef = useRef(null);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  // State for the reset password with code modal
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  // Démarrer / arrêter la caméra pour Face ID
  useEffect(() => {
    if (showFaceIdModal) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Erreur accès caméra :", err);
          setError("Impossible d'accéder à la caméra.");
        });
    } else {
      // Stopper la caméra quand on ferme la modale
      if (videoRef.current && videoRef.current.srcObject) {
        let tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  }, [showFaceIdModal]);

  // Gestion changement inputs
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Connexion classique
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

  // Authentification via Face ID
  const handleFaceAuth = async () => {
    if (!formData.email) {
      setError("Veuillez d'abord entrer votre email.");
      return;
    }
    if (!videoRef.current) return;
    setFaceLoginLoading(true);
    setError('');

    try {
      // Capture image de la vidéo
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const frameBase64 = canvas.toDataURL("image/jpeg").split(",")[1];

      // Envoyer l'image au backend Node.js pour vérification
      const response = await fetch(
        "http://localhost:5001/api/users/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            frame: frameBase64,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Échec de l'authentification faciale");
        return;
      }

      // Succès : stocker le token et rediriger
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/home";
    } catch (err) {
      setError("Erreur reconnaissance faciale : " + err.message);
    } finally {
      setFaceLoginLoading(false);
      setShowFaceIdModal(false); // Close modal on finish
    }
  };

  // Envoi du code pour mot de passe oublié
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    try {
      const response = await fetch('http://localhost:5001/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        setForgotMessage(data.error || 'Erreur lors de l\'envoi du code.');
        return;
      }
      setForgotMessage('Code de réinitialisation envoyé avec succès. Veuillez vérifier vos emails.');
      setShowForgotModal(false);
      setShowResetModal(true);
    } catch (err) {
      setForgotMessage('Erreur serveur.');
    }
  };

  // Réinitialisation du mot de passe avec le code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setResetMessage('Les mots de passe ne correspondent pas.');
      return;
    }
    setResetMessage('');
    try {
      const response = await fetch('http://localhost:5001/api/users/reset-password-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail, // L'email est nécessaire pour retrouver l'utilisateur
          code: resetCode,
          newPassword: newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setResetMessage(data.error || 'Erreur lors de la réinitialisation.');
        return;
      }
      setResetMessage('Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.');
      setTimeout(() => {
        setShowResetModal(false);
        setResetMessage('');
      }, 3000);
    } catch (err) {
      setResetMessage('Erreur serveur.');
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
            className="btn btn-secondary w-100 mt-2"
            onClick={() => setShowFaceIdModal(true)}
          >
            Se connecter avec Face ID
          </button>
        </div>

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

      {/* Pop-up Face ID */}
      {showFaceIdModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Connexion Face ID</h5>
                <button type="button" className="btn-close" onClick={() => setShowFaceIdModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <video ref={videoRef} style={{ width: '100%' }} autoPlay></video>
                <button className="btn btn-primary w-100 mt-3" onClick={handleFaceAuth} disabled={faceLoginLoading}>
                  {faceLoginLoading ? 'Authentification...' : 'S\'authentifier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Mot de passe oublié */}
      {showForgotModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Mot de passe oublié</h5>
                <button type="button" className="btn-close" onClick={() => setShowForgotModal(false)}></button>
              </div>
              <div className="modal-body">
                {forgotMessage && <div className={`alert ${forgotMessage.includes('succès') ? 'alert-success' : 'alert-danger'}`}>{forgotMessage}</div>}
                <form onSubmit={handleForgotPassword}>
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
                  <button type="submit" className="btn btn-primary w-100">Envoyer le code</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Réinitialiser le mot de passe */}
      {showResetModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Réinitialiser le mot de passe</h5>
                <button type="button" className="btn-close" onClick={() => setShowResetModal(false)}></button>
              </div>
              <div className="modal-body">
                {resetMessage && <div className={`alert ${resetMessage.includes('succès') ? 'alert-success' : 'alert-danger'}`}>{resetMessage}</div>}
                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label htmlFor="resetCode" className="form-label">Code de réinitialisation</label>
                    <input type="text" id="resetCode" className="form-control" value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder="Code reçu par email" required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">Nouveau mot de passe</label>
                    <input type="password" id="newPassword" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
                    <input type="password" id="confirmPassword" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
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
