import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isUsingFaceRecognition, setIsUsingFaceRecognition] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceRecognitionStatus, setFaceRecognitionStatus] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [currentPosition, setCurrentPosition] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Webcam
  useEffect(() => {
    if (isUsingFaceRecognition) {
      navigator.mediaDevices
        .getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
        })
        .then((stream) => {
          setVideoStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => videoRef.current.play();
          }
        })
        .catch(() => {
          setError("Impossible d'accéder à la webcam.");
          setIsUsingFaceRecognition(false);
        });
    } else if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
  }, [isUsingFaceRecognition]);

  // Capture du frame
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 1.0).split(',')[1];
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const frameData = isUsingFaceRecognition ? captureFrame() : null;
      const bodyData = frameData ? { ...formData, frame: frameData } : formData;

      const response = await fetch('http://localhost:5001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      if (!response.ok) return setError(data.error || 'Erreur de connexion');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/home';
    } catch {
      setError("Impossible de se connecter au serveur.");
    } finally {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
        setIsUsingFaceRecognition(false);
      }
    }
  };

  const startFaceRecognition = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/start-recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1 }) // <-- Ajout du user_id
      });
      const data = await response.json();
      if (!response.ok) return setError(`Erreur: ${data.error || 'Session non créée'}`);
      setSessionId(data.session_id);
      setFaceRecognitionStatus('Session démarrée, positionnez votre visage...');
      startContinuousVerification(data.session_id);
    } catch {
      setError('Erreur réseau lors du démarrage de la reconnaissance faciale');
    }
  };

  const startContinuousVerification = (sessionId) => {
    const interval = setInterval(async () => {
      const frameData = captureFrame();
      if (!frameData) return;
      try {
        const response = await fetch('http://localhost:5000/api/verify-face', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, frame: frameData }),
        });
        const data = await response.json();
        if (data.authenticated) {
          clearInterval(interval);
          setFaceRecognitionStatus('Visage reconnu ! Connexion...');
          const loginResponse = await fetch('http://localhost:5001/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'face_recognition@temp.com', password: 'temp_password', user_id: data.user_id }),
          });
          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('user', JSON.stringify(loginData.user));
            window.location.href = '/home';
          } else setError('Erreur lors de la connexion automatique');
        } else if (data.fallback_required) {
          clearInterval(interval);
          setModalMessage('❌ Visage non reconnu après plusieurs tentatives.\n\nVeuillez utiliser votre mot de passe.');
          setShowModal(true);
          setFaceRecognitionStatus('Reconnaissance échouée. Utilisez le mot de passe.');
          setIsUsingFaceRecognition(false);
        } else {
          setFaceRecognitionStatus(data.message || 'Vérification en cours...');
        }
      } catch {
        clearInterval(interval);
        alert('⚠️ Erreur serveur reconnaissance faciale.\n\nVeuillez utiliser votre mot de passe.');
        setIsUsingFaceRecognition(false);
      }
    }, 1000);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      backgroundImage: 'url("/uploads/Capgemini-Logo.jpg")',
      backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center'
    }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: '450px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <h4 className="text-center fw-semibold mb-4">Connexion 🔐</h4>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="email" id="email" name="email" className="form-control"
              value={formData.email} onChange={handleChange} placeholder="Entrez votre email" required />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <input type="password" id="password" name="password" className="form-control"
              value={formData.password} onChange={handleChange} placeholder="••••••••••••" required />
          </div>
          <div className="mb-3 form-check">
            <input type="checkbox" className="form-check-input" id="useFaceRecognition"
              checked={isUsingFaceRecognition} onChange={(e) => setIsUsingFaceRecognition(e.target.checked)} />
            <label className="form-check-label" htmlFor="useFaceRecognition">Utiliser la reconnaissance faciale</label>
          </div>
          {isUsingFaceRecognition && (
            <div className="mb-3 text-center">
              <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: '300px' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {currentPosition && (
                <div className="alert alert-warning mt-2">
                  <strong>Position requise:</strong> {currentPosition}<br />
                  <small>Positionnez votre visage vers la {currentPosition}</small>
                </div>
              )}
              {faceRecognitionStatus && <div className="alert alert-info mt-2">{faceRecognitionStatus}</div>}
              <div className="mt-2">
                <button type="button" className="btn btn-success me-2" onClick={startFaceRecognition}>Démarrer la reconnaissance</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsUsingFaceRecognition(false)}>Annuler</button>
              </div>
            </div>
          )}
          <button type="submit" className="btn btn-primary w-100">Se connecter</button>
        </form>
        <p className="text-center mt-3 text-muted">
          Pas encore de compte ? <a href="/register" className="text-primary text-decoration-none">Créer un compte</a>
        </p>
      </div>
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">🔐 Reconnaissance Faciale</h5></div>
              <div className="modal-body text-center"><p style={{ whiteSpace: 'pre-line' }}>{modalMessage}</p></div>
              <div className="modal-footer"><button type="button" className="btn btn-primary" onClick={() => setShowModal(false)}>Compris</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
