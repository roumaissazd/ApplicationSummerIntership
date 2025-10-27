import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Cacher la navbar sur certaines routes
  const hideNavbar = ["/login", "/register", "/create-account"].includes(location.pathname);
  if (hideNavbar) return null;

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5001/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/assignment-calendar', label: 'Calendar', icon: '📅' },
    { path: '/chat', label: 'Messages', icon: '💬' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-glass backdrop-blur-md border-b border-glass-border shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-text-primary font-bold font-sans text-lg">Capgemini</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 font-sans flex items-center space-x-2 ${
                    isActive(item.path)
                      ? 'bg-accent-blue/20 text-accent-blue shadow-glow'
                      : 'text-text-secondary hover:text-text-primary hover:bg-dark-secondary/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-3 text-text-primary hover:text-accent-blue transition-colors duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-pink rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <svg className="w-4 h-4 transition-transform duration-300" style={{ transform: isProfileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-glass backdrop-blur-md rounded-lg shadow-glass border border-glass-border py-1 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-dark-secondary/50 transition-colors duration-300 font-sans"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        👤 View Profile
                      </Link>
                      <Link
                        to="/edit-profile"
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-dark-secondary/50 transition-colors duration-300 font-sans"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        ⚙️ Edit Profile
                      </Link>
                      <hr className="border-glass-border my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-accent-red hover:bg-accent-red/10 transition-colors duration-300 font-sans"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-accent-blue to-accent-purple text-white px-4 py-2 rounded-lg hover:from-accent-purple hover:to-accent-pink transition-all duration-300 font-sans text-sm font-semibold shadow-glow"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-text-primary hover:text-accent-blue p-2 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-glass backdrop-blur-md border-t border-glass-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 font-sans flex items-center space-x-2 ${
                  isActive(item.path)
                    ? 'bg-accent-blue/20 text-accent-blue shadow-glow'
                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-secondary/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {user ? (
              <div className="border-t border-glass-border pt-4 mt-4">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-pink rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-sm text-text-primary hover:bg-dark-secondary/50 transition-colors duration-300 font-sans"
                  onClick={() => setIsMenuOpen(false)}
                >
                  👤 View Profile
                </Link>
                <Link
                  to="/edit-profile"
                  className="block px-3 py-2 text-sm text-text-primary hover:bg-dark-secondary/50 transition-colors duration-300 font-sans"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ⚙️ Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm text-accent-red hover:bg-accent-red/10 transition-colors duration-300 font-sans"
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-glass-border pt-4 mt-4">
                <Link
                  to="/login"
                  className="block bg-gradient-to-r from-accent-blue to-accent-purple text-white px-3 py-2 rounded-lg hover:from-accent-purple hover:to-accent-pink transition-all duration-300 font-sans text-center font-semibold shadow-glow"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;