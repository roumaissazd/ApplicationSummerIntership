import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import mqtt from "mqtt";
import CombinedUsageCard from "../components/GpuCombinedCard";
import RamCard from "../components/RamCard";
import DiskCard from "../components/DiskCard";
import CpuCard from "../components/CpuCard";
import NetworkCard from "../components/NetworkCard";
import BatteryCard from "../components/BatteryCard";

function Dashboard() {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    ram: 0,
    disk: 0,
    gpu: [], // Historique des valeurs
    gpuMem: [], // Historique des valeurs
    bytesSent: 0,
    bytesReceived: 0,
    battery: 100, // Donnée non fournie par le script Python de base
    charging: false,
  });

  const [highestRisk, setHighestRisk] = useState({ risk: 0, component: 'System' });
  const [labels, setLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token'); // Récupérer le token

  useEffect(() => {
    // --- Configuration MQTT ---
    const MQTT_BROKER = "ws://broker.hivemq.com:8000/mqtt"; // Broker public via WebSockets
    const MQTT_TOPIC = "system/metrics/rouzd-pc"; // Doit correspondre au topic du publisher

    // Connexion au broker MQTT
    const client = mqtt.connect(MQTT_BROKER);

    client.on("connect", () => {
      console.log("Connecté au broker MQTT via WebSocket !");
      setIsLoading(false);
      client.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
          console.error("Erreur d'abonnement:", err);
        }
      });
    });

    // Réception des messages
    client.on("message", (topic, message) => {
      if (topic === MQTT_TOPIC) {
        const data = JSON.parse(message.toString());
        // Met à jour l'état avec les nouvelles données
        setMetrics(prev => ({
          ...prev, ...data,
          gpu: [...prev.gpu, data.gpu].slice(-10),
          gpuMem: [...prev.gpuMem, data.gpuMem].slice(-10)
        }));
        // Met à jour les labels pour le graphique historique
        setLabels(prev => [...prev, new Date().toLocaleTimeString()].slice(-10));
      }
    });

    // Nettoyage à la fermeture du composant
    return () => {
      if (client) {
        client.end();
      }
    };
  }, []);

  // Effet pour récupérer les prédictions périodiquement
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/predictions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.predictions && data.predictions.length > 0) {
          const maxRisk = data.predictions.reduce((max, p) => p.risk_percent > max.risk_percent ? p : max, { risk_percent: 0 });
          setHighestRisk({ risk: maxRisk.risk_percent, component: maxRisk.component });
        }
      } catch (err) {
        console.error("Erreur de prédiction:", err);
      }
    };
    fetchPredictions();
    const interval = setInterval(fetchPredictions, 60000); // Toutes les 60 secondes
    return () => clearInterval(interval);
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-primary font-sans">Connecting to monitoring system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary font-sans mb-2">System Dashboard</h1>
        <p className="text-text-secondary font-sans">Real-time monitoring of your machine performance</p>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary font-sans text-sm">System Status</p>
              <p className="text-accent-green font-semibold font-sans">Online</p>
            </div>
            <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary font-sans text-sm">Uptime</p>
              <p className="text-text-primary font-semibold font-mono">2h 34m</p>
            </div>
            <div className="text-accent-blue">⏱️</div>
          </div>
        </div>
        <Link to="/risks">
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6 h-full hover:border-accent-blue transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary font-sans text-sm">Santé du Système (IA)</p>
                <p className={`text-xl font-bold font-sans ${highestRisk.risk > 40 ? 'text-accent-yellow' : 'text-accent-green'}`}>
                  {highestRisk.risk > 0 ? `Risque: ${Math.round(highestRisk.risk)}%` : 'Normal'}
                </p>
              </div>
              <div className="text-3xl">🔮</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - System Metrics */}
        <div className="lg:col-span-8 space-y-6">
          {/* CPU, RAM, Disk Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CpuCard data={metrics.cpu} />
            <RamCard data={metrics.ram} />
            <DiskCard data={metrics.disk} />
          </div>

          {/* GPU Chart */}
          <CombinedUsageCard gpuData={metrics.gpu} gpuMemData={metrics.gpuMem} labels={labels} />
        </div>

        {/* Right Column - Network and Battery */}
        <div className="lg:col-span-4 space-y-6">
          <NetworkCard
            bytesSent={metrics.bytesSent}
            bytesReceived={metrics.bytesReceived}
          />
          <BatteryCard
            battery={metrics.battery}
            charging={metrics.charging}
          />

          {/* Additional Info Card */}
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6">
            <h3 className="text-lg font-semibold text-text-primary font-sans mb-4">System Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary font-sans text-sm">OS</span>
                <span className="text-text-primary font-mono text-sm">Windows 11</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary font-sans text-sm">Host</span>
                <span className="text-text-primary font-mono text-sm">rouzd-pc</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary font-sans text-sm">Last Update</span>
                <span className="text-text-primary font-mono text-sm">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
