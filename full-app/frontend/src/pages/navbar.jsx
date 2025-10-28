import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [hasNewAssignment, setHasNewAssignment] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Vérifier les nouvelles assignations et messages
  useEffect(() => {
    const checkNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      try {
        // Vérifier les assignations
        const assignmentResponse = await fetch('http://localhost:5001/api/assignments/my', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (assignmentResponse.ok) {
          const assignmentData = await assignmentResponse.json();
          const currentAssignments = assignmentData.length;

          // Vérifier s'il y a de nouvelles assignations
          const lastKnownCount = localStorage.getItem('lastAssignmentCount') || 0;
          if (currentAssignments > parseInt(lastKnownCount)) {
            setHasNewAssignment(true);
            // Ajouter notification pour nouvelle assignation
            const newAssignmentNotification = {
              id: Date.now() + Math.random(),
              type: 'assignment',
              title: 'Nouvelle assignation',
              message: 'Vous avez une nouvelle tâche assignée',
              timestamp: new Date(),
              read: false
            };
            setNotifications(prev => [newAssignmentNotification, ...prev].slice(0, 10));

            // Notification browser si supporté
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Nouvelle assignation', {
                body: 'Vous avez une nouvelle tâche assignée',
                icon: '/favicon.ico'
              });
            }
          }

          // Mettre à jour le compteur stocké
          localStorage.setItem('lastAssignmentCount', currentAssignments.toString());
          setAssignments(assignmentData);
        }

        // Vérifier les messages non lus
        const chatResponse = await fetch('http://localhost:5001/api/chat/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (chatResponse.ok) {
          const conversationsData = await chatResponse.json();
          const lastMessageCheck = localStorage.getItem('lastMessageCheck') || Date.now();

          // Vérifier si de nouveaux messages ont été envoyés depuis la dernière vérification
          const newMessages = conversationsData.conversations?.filter(conv => {
            const lastMessageTime = new Date(conv.lastMessage?.timestamp || 0).getTime();
            return lastMessageTime > parseInt(lastMessageCheck) && conv.lastMessage?.sender !== user.id;
          }) || [];

          if (newMessages.length > 0) {
            // Ajouter notification pour nouveaux messages
            const newMessageNotification = {
              id: Date.now() + Math.random(),
              type: 'message',
              title: 'Nouveau message',
              message: `Vous avez ${newMessages.length} nouveau(x) message(s)`,
              timestamp: new Date(),
              read: false
            };
            setNotifications(prev => [newMessageNotification, ...prev].slice(0, 10));

            // Notification browser
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Nouveau message', {
                body: `Vous avez ${newMessages.length} nouveau(x) message(s)`,
                icon: '/favicon.ico'
              });
            }
          }

          // Mettre à jour le timestamp de dernière vérification
          localStorage.setItem('lastMessageCheck', Date.now().toString());
        }

        // Vérifier les notifications système (alertes de santé système)
        try {
          const riskRes = await fetch('http://localhost:5001/api/predictions', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (riskRes.ok) {
            const riskData = await riskRes.json();
            if (riskData.predictions && riskData.predictions.length > 0) {
              const criticalRisks = riskData.predictions.filter(p => p.risk_percent > 70);
              if (criticalRisks.length > 0) {
                const newNotifications = criticalRisks.map(risk => ({
                  id: Date.now() + Math.random(),
                  type: 'system_risk',
                  title: `Risque critique détecté`,
                  message: `${risk.component}: ${Math.round(risk.risk_percent)}% de risque`,
                  timestamp: new Date(),
                  read: false
                }));
                setNotifications(prev => [...newNotifications, ...prev].slice(0, 10)); // Garder 10 dernières
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors de la vérification des risques système:', error);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des notifications:', error);
      }
    };

    // Vérifier immédiatement et toutes les 30 secondes
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Demander la permission pour les notifications
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
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
    { path: '/assignment-calendar', label: 'Calendar', icon: '📅', hasAlert: hasNewAssignment },
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 font-sans flex items-center space-x-2 relative ${
                    isActive(item.path)
                      ? 'bg-accent-blue/20 text-accent-blue shadow-glow'
                      : 'text-text-secondary hover:text-text-primary hover:bg-dark-secondary/50'
                  }`}
                  onClick={() => item.hasAlert && setHasNewAssignment(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.hasAlert && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-red rounded-full animate-pulse"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-text-primary hover:text-accent-blue transition-colors duration-300 p-2 relative"
                  >
                    🔔
                    {notifications.filter(n => !n.read).length > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-red rounded-full animate-pulse"></div>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-glass backdrop-blur-md rounded-lg shadow-glass border border-glass-border py-2 z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-glass-border">
                        <h3 className="text-sm font-semibold text-text-primary font-sans">Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-4 text-center text-text-secondary font-sans text-sm">
                          Aucune notification
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-glass-border hover:bg-dark-secondary/50 cursor-pointer ${
                              !notification.read ? 'bg-accent-blue/10' : ''
                            }`}
                            onClick={() => {
                              setNotifications(prev =>
                                prev.map(n =>
                                  n.id === notification.id ? { ...n, read: true } : n
                                )
                              );
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {notification.type === 'assignment' ? '📅' :
                                 notification.type === 'message' ? '💬' : '⚠️'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary font-sans truncate">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-text-secondary font-sans">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-text-secondary font-mono mt-1">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      {notifications.length > 0 && (
                        <div className="px-4 py-2">
                          <button
                            onClick={() => setNotifications([])}
                            className="text-xs text-accent-blue hover:text-accent-purple transition-colors font-sans"
                          >
                            Tout marquer comme lu
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

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
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 font-sans flex items-center space-x-2 relative ${
                  isActive(item.path)
                    ? 'bg-accent-blue/20 text-accent-blue shadow-glow'
                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-secondary/50'
                }`}
                onClick={() => {
                  setIsMenuOpen(false);
                  if (item.hasAlert) setHasNewAssignment(false);
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.hasAlert && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-red rounded-full animate-pulse"></div>
                )}
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