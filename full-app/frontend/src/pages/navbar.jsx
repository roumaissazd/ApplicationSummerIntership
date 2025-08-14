import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css'; // Import du fichier CSS

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Cacher la navbar sur certaines routes
  const hideNavbar = ["/login", "/register", "/create-account"].includes(location.pathname);
  if (hideNavbar) return null;

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch("http://localhost:5001/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Échec de la déconnexion", err);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg custom-blue-navbar px-3">
      <a className="navbar-brand text-white" href="/">MonApp</a>

      <div className="ms-auto d-flex align-items-center gap-3">
        {/* Icône vers le profil utilisateur */}
        <button
          className="btn btn-link text-white"
          onClick={() => navigate('/profile')}
          title="Voir le profil"
        >
          <i className="bi bi-person-circle fs-4"></i>
        </button>

        {/* Icône de déconnexion */}
        <button
          className="btn btn-link text-white"
          onClick={handleLogout}
          title="Se déconnecter"
        >
          <i className="bi bi-box-arrow-right fs-4"></i>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;