import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 via-accent-purple/20 to-accent-pink/20"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent-blue rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-accent-purple rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-accent-pink rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '4s' }}></div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <h1 className="text-6xl font-bold text-white font-sans mb-6 animate-gradient bg-gradient-to-r from-white via-accent-blue to-accent-purple bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-xl text-text-secondary font-sans mb-8 max-w-md">
            Access your enterprise monitoring dashboard with advanced security and real-time insights
          </p>
          <div className="flex space-x-4">
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-accent-purple rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-3 h-3 bg-accent-pink rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary font-sans mb-2">Sign In</h2>
            <p className="text-text-secondary font-sans">Enter your credentials to access the system</p>
          </div>

          {/* Login Form */}
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-8">
            {error && (
              <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 mb-6">
                <p className="text-accent-red font-sans text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary font-sans mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary font-sans mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold py-3 px-4 rounded-lg hover:from-accent-purple hover:to-accent-pink transition-all duration-300 font-sans hover:shadow-glow"
              >
                Sign In
              </button>
            </form>

            {/* Alternative Login Options */}
            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-glass-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-dark-primary text-text-secondary font-sans">Or continue with</span>
                </div>
              </div>

              <button
                className="w-full bg-dark-secondary/50 border border-glass-border text-text-primary font-semibold py-3 px-4 rounded-lg hover:bg-dark-secondary hover:shadow-glow transition-all duration-300 font-sans flex items-center justify-center space-x-2"
                onClick={() => setShowFaceIdModal(true)}
              >
                <span>📷</span>
                <span>Face ID Login</span>
              </button>
            </div>

            {/* Forgot Password */}
            <div className="mt-6 text-center">
              <button
                className="text-accent-blue hover:text-accent-purple transition-colors duration-300 font-sans text-sm"
                onClick={() => setShowForgotModal(true)}
              >
                Forgot your password?
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-text-secondary font-sans text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-accent-blue hover:text-accent-purple transition-colors duration-300 font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Face ID Modal */}
      {showFaceIdModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-text-primary font-sans mb-2">Face ID Authentication</h3>
              <p className="text-text-secondary font-sans text-sm">Position your face in the camera frame</p>
            </div>

            <div className="relative mb-6">
              <video
                ref={videoRef}
                className="w-full h-64 bg-dark-secondary rounded-lg object-cover"
                autoPlay
              ></video>
              <div className="absolute inset-0 border-2 border-accent-blue rounded-lg animate-pulse"></div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-accent-green to-accent-blue text-white font-semibold py-3 px-4 rounded-lg hover:from-accent-blue hover:to-accent-purple transition-all duration-300 font-sans disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleFaceAuth}
              disabled={faceLoginLoading}
            >
              {faceLoginLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Authenticate'
              )}
            </button>

            <button
              className="w-full mt-3 text-text-secondary hover:text-text-primary transition-colors duration-300 font-sans"
              onClick={() => setShowFaceIdModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-text-primary font-sans mb-2">Reset Password</h3>
              <p className="text-text-secondary font-sans text-sm">Enter your email to receive a reset code</p>
            </div>

            {forgotMessage && (
              <div className={`p-4 rounded-lg mb-6 ${
                forgotMessage.includes('succès') ? 'bg-accent-green/10 border border-accent-green/20' : 'bg-accent-red/10 border border-accent-red/20'
              }`}>
                <p className={`font-sans text-sm ${
                  forgotMessage.includes('succès') ? 'text-accent-green' : 'text-accent-red'
                }`}>
                  {forgotMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="forgotEmail" className="block text-sm font-medium text-text-primary font-sans mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="forgotEmail"
                  className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold py-3 px-4 rounded-lg hover:from-accent-purple hover:to-accent-pink transition-all duration-300 font-sans"
              >
                Send Reset Code
              </button>
            </form>

            <button
              className="w-full mt-3 text-text-secondary hover:text-text-primary transition-colors duration-300 font-sans"
              onClick={() => setShowForgotModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-text-primary font-sans mb-2">Reset Password</h3>
              <p className="text-text-secondary font-sans text-sm">Enter the code and your new password</p>
            </div>

            {resetMessage && (
              <div className={`p-4 rounded-lg mb-6 ${
                resetMessage.includes('succès') ? 'bg-accent-green/10 border border-accent-green/20' : 'bg-accent-red/10 border border-accent-red/20'
              }`}>
                <p className={`font-sans text-sm ${
                  resetMessage.includes('succès') ? 'text-accent-green' : 'text-accent-red'
                }`}>
                  {resetMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="resetCode" className="block text-sm font-medium text-text-primary font-sans mb-2">
                  Reset Code
                </label>
                <input
                  type="text"
                  id="resetCode"
                  className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-mono"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter reset code"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary font-sans mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary font-sans mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-4 py-3 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-accent-green to-accent-blue text-white font-semibold py-3 px-4 rounded-lg hover:from-accent-blue hover:to-accent-purple transition-all duration-300 font-sans"
              >
                Reset Password
              </button>
            </form>

            <button
              className="w-full mt-3 text-text-secondary hover:text-text-primary transition-colors duration-300 font-sans"
              onClick={() => setShowResetModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
