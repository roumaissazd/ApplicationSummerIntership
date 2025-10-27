import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import MachineModal from '../components/MachineModal';

const Home = () => {
  // Machines définies localement (fallback si aucune machine en BD)
  const [localMachines] = useState([
    {
      id: 1,
      name: 'Machine A',
      status: 'online',
      cpu: 45,
      ram: 67,
      location: 'Server Room A1',
      lastSeen: '2 min ago',
      serialNumber: 'SN001'
    },
    {
      id: 2,
      name: 'Machine B',
      status: 'online',
      cpu: 23,
      ram: 45,
      location: 'Server Room B2',
      lastSeen: '1 min ago',
      serialNumber: 'SN002'
    },
    {
      id: 3,
      name: 'Machine C',
      status: 'warning',
      cpu: 89,
      ram: 92,
      location: 'Server Room C3',
      lastSeen: '5 min ago',
      serialNumber: 'SN003'
    },
    {
      id: 4,
      name: 'Machine D',
      status: 'offline',
      cpu: 0,
      ram: 0,
      location: 'Server Room D4',
      lastSeen: '1 hour ago',
      serialNumber: 'SN004'
    },
  ]);
  
  // Machines provenant de la base de données
  const [dbMachines, setDbMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [showAllMachines, setShowAllMachines] = useState(false); // Option pour afficher toutes les machines
  
  // État combiné pour toutes les machines
  const [machines, setMachines] = useState([]);
  const [animatedCounters, setAnimatedCounters] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); // Ajout de l'état pour le rôle utilisateur

  const API_URL = "http://localhost:5001/api";
  const token = localStorage.getItem('token');

  // Récupérer les informations de l'utilisateur et son rôle
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (token) {
          // Décoder le token pour obtenir les informations de l'utilisateur
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setUserRole(tokenData.role || 'user');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du rôle utilisateur:', error);
        setUserRole('user');
      }
    };

    fetchUserRole();
  }, [token]);

  // Récupérer les machines depuis la base de données
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        console.log("Tentative de récupération des machines...");
        console.log("Token:", token ? "Présent" : "Absent");
        
        // Essayer d'abord avec l'endpoint filtré par créateur
        let response = await fetch(`${API_URL}/machines`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Réponse reçue (machines par créateur):", response.status);
        
        let data;
        
        if (!response.ok) {
          // Si ça échoue, essayer avec l'endpoint pour toutes les machines
          console.log("Échec avec l'endpoint filtré, tentative avec toutes les machines...");
          response = await fetch(`${API_URL}/machines/all`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log("Réponse reçue (toutes les machines):", response.status);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          data = await response.json();
          console.log("Données reçues (toutes les machines):", data);
          
          // Si c'est un tableau direct
          if (Array.isArray(data)) {
            setDbMachines(data);
          } else {
            console.error("Format de réponse inattendu:", data);
            setDbMachines([]);
          }
        } else {
          data = await response.json();
          console.log("Données reçues (machines par créateur):", data);
          
          // Vérifier différents formats de réponse possibles
          if (data.machines && Array.isArray(data.machines)) {
            setDbMachines(data.machines);
          } else if (Array.isArray(data)) {
            setDbMachines(data);
          } else {
            console.error("Format de réponse inattendu:", data);
            setDbMachines([]);
          }
        }
        
        setApiStatus('success');
      } catch (err) {
        console.error("Erreur lors de la récupération des machines:", err);
        setError(err.message);
        setApiStatus('error');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMachines();
    } else {
      console.log("Pas de token, utilisation des machines locales");
      setApiStatus('error');
      setLoading(false);
    }
  }, [token]);

  // Combiner les machines locales et celles de la BD
  useEffect(() => {
    // Utiliser les machines de la BD si disponibles, sinon utiliser les machines locales
    const allMachines = apiStatus === 'success' && dbMachines.length > 0 ? dbMachines : localMachines;
    console.log("Machines finales affichées:", allMachines);
    setMachines(allMachines);
  }, [dbMachines, localMachines, apiStatus]);

  // Mettre à jour les compteurs animés lorsque les machines changent
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedCounters({
        total: machines.length,
        online: machines.filter(m => m.status === 'online' || m.status === 'active').length,
        warning: machines.filter(m => m.status === 'warning' || m.status === 'maintenance').length,
        offline: machines.filter(m => m.status === 'offline' || m.status === 'inactive').length,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [machines]);

  const handleAddMachine = async (newMachine) => {
    try {
      console.log("Tentative d'ajout de machine:", newMachine);
      
      // Envoyer la nouvelle machine à l'API
      const response = await fetch(`${API_URL}/machines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMachine)
      });
      
      console.log("Réponse d'ajout:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur détaillée:", errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const savedMachine = await response.json();
      console.log("Machine sauvegardée:", savedMachine);
      
      // Transformer la machine sauvegardée pour correspondre au format attendu
      const transformedMachine = {
        id: savedMachine.machine._id,
        name: savedMachine.machine.name,
        status: savedMachine.machine.status === 'active' ? 'online' : 
               savedMachine.machine.status === 'maintenance' ? 'warning' : 
               savedMachine.machine.status === 'inactive' ? 'offline' : 'offline',
        cpu: Math.floor(Math.random() * 100),
        ram: Math.floor(Math.random() * 100),
        location: savedMachine.machine.location || 'Non spécifiée',
        lastSeen: 'Just now',
        serialNumber: savedMachine.machine.serialNumber
      };
      
      // Mettre à jour l'état avec la nouvelle machine
      setDbMachines(prev => [...prev, transformedMachine]);
      
      // Fermer le modal
      setIsModalOpen(false);
      
    } catch (err) {
      console.error("Erreur lors de l'ajout de la machine:", err);
      alert(`Erreur lors de l'ajout de la machine: ${err.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': 
      case 'active': 
        return 'text-accent-green';
      case 'warning': 
      case 'maintenance': 
        return 'text-accent-yellow';
      case 'offline': 
      case 'inactive': 
        return 'text-accent-red';
      default: return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': 
      case 'active': 
        return '🟢';
      case 'warning': 
      case 'maintenance': 
        return '🟡';
      case 'offline': 
      case 'inactive': 
        return '🔴';
      default: return '⚪';
    }
  };

  // Transformer les machines de la BD pour correspondre au format attendu
  const transformedMachines = machines.map(machine => {
    // Si la machine vient de la BD, elle a déjà le bon format
    if (machine._id) {
      return {
        id: machine._id,
        name: machine.name,
        status: machine.status === 'active' ? 'online' : 
               machine.status === 'maintenance' ? 'warning' : 
               machine.status === 'inactive' ? 'offline' : 'offline',
        cpu: Math.floor(Math.random() * 100), // Valeurs aléatoires pour la démo
        ram: Math.floor(Math.random() * 100),
        location: machine.location || 'Non spécifiée',
        lastSeen: 'Just now',
        serialNumber: machine.serialNumber
      };
    }
    // Sinon, c'est déjà une machine locale
    return machine;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-primary font-sans">Chargement des machines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent-blue rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-accent-purple rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-accent-pink rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-text-primary font-sans mb-4 animate-gradient bg-gradient-to-r from-accent-blue via-accent-purple to-accent-pink bg-clip-text text-transparent">
            Machine Dashboard
          </h1>
          <p className="text-xl text-text-secondary font-sans max-w-2xl mx-auto">
            Monitor and manage your enterprise infrastructure with real-time insights and advanced analytics
          </p>
          
          {/* Messages d'état */}
          {apiStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
              <p className="text-red-300 text-sm">
                {error ? `Erreur: ${error}.` : "Impossible de se connecter à l'API."} 
                {token ? " Affichage des machines locales." : " Veuillez vous connecter pour voir les machines de la base de données."}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Réessayer
              </button>
            </div>
          )}
          
          {apiStatus === 'success' && dbMachines.length === 0 && (
            <div className="mt-4 p-3 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg">
              <p className="text-yellow-300 text-sm">Aucune machine trouvée dans la base de données. Affichage des machines de démonstration.</p>
              <button 
                onClick={() => setShowAllMachines(!showAllMachines)} 
                className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                {showAllMachines ? "Masquer" : "Afficher"} toutes les machines
              </button>
            </div>
          )}
          
          {apiStatus === 'success' && dbMachines.length > 0 && (
            <div className="mt-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg">
              <p className="text-green-300 text-sm">{dbMachines.length} machine(s) trouvée(s) dans la base de données.</p>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6 text-center hover:shadow-glow hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-text-primary font-mono mb-2">{animatedCounters.total || 0}</div>
            <div className="text-text-secondary font-sans text-sm">Total Machines</div>
          </div>
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6 text-center hover:shadow-glow hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-accent-green font-mono mb-2">{animatedCounters.online || 0}</div>
            <div className="text-text-secondary font-sans text-sm">Online</div>
          </div>
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6 text-center hover:shadow-glow-purple hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-accent-yellow font-mono mb-2">{animatedCounters.warning || 0}</div>
            <div className="text-text-secondary font-sans text-sm">Warning</div>
          </div>
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6 text-center hover:shadow-glow hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-accent-red font-mono mb-2">{animatedCounters.offline || 0}</div>
            <div className="text-text-secondary font-sans text-sm">Offline</div>
          </div>
        </div>

        {/* Add Machine Button - Affiché uniquement pour les admins */}
        {userRole === 'admin' && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold py-2 px-4 rounded-lg hover:from-accent-purple hover:to-accent-pink transition-all duration-300 font-sans"
            >
              <Plus size={18} />
              Ajouter une machine
            </button>
          </div>
        )}

        {/* Machine Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {transformedMachines.map((machine, index) => (
            <div
              key={machine.id}
              className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6 hover:shadow-glow hover:scale-105 transition-all duration-300 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Status Indicator */}
              <div className="flex justify-between items-center mb-4">
                <div className={`text-2xl ${getStatusColor(machine.status)}`}>
                  {getStatusIcon(machine.status)}
                </div>
                <div className="text-xs text-text-secondary font-mono">
                  {machine.lastSeen}
                </div>
              </div>

              {/* Machine Name */}
              <h3 className="text-xl font-bold text-text-primary font-sans mb-2">
                {machine.name}
              </h3>

              {/* Serial Number */}
              <p className="text-text-secondary font-sans text-xs mb-2">
                N° Série: {machine.serialNumber}
              </p>

              {/* Location */}
              <p className="text-text-secondary font-sans text-sm mb-4">
                📍 {machine.location}
              </p>

              {/* Metrics */}
              {machine.status !== 'offline' && machine.status !== 'inactive' && (
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary font-sans">CPU</span>
                      <span className="text-text-primary font-mono">{machine.cpu}%</span>
                    </div>
                    <div className="w-full bg-dark-tertiary rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-accent-blue to-accent-cyan h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${machine.cpu}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary font-sans">RAM</span>
                      <span className="text-text-primary font-mono">{machine.ram}%</span>
                    </div>
                    <div className="w-full bg-dark-tertiary rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-accent-purple to-accent-pink h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${machine.ram}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Link
                to={`/dashboard/${machine.id}`}
                className="w-full bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold py-2 px-4 rounded-lg hover:from-accent-purple hover:to-accent-pink transition-all duration-300 text-center block font-sans"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-text-secondary font-sans">
            Powered by Capgemini Infrastructure Monitoring System
          </p>
        </div>
      </div>

      {/* Machine Modal */}
      <MachineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMachine={handleAddMachine}
      />
    </div>
  );
};

export default Home;