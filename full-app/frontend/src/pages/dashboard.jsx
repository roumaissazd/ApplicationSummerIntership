import React, { useState, useEffect } from "react";
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

  const [labels, setLabels] = useState([]);

  useEffect(() => {
    // --- Configuration MQTT ---
    const MQTT_BROKER = "ws://broker.hivemq.com:8000/mqtt"; // Broker public via WebSockets
    const MQTT_TOPIC = "system/metrics/rouzd-pc"; // Doit correspondre au topic du publisher

    // Connexion au broker MQTT
    const client = mqtt.connect(MQTT_BROKER);

    client.on("connect", () => {
      console.log("Connecté au broker MQTT via WebSocket !");
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
    return () => client.end();
  }, []);

  return (
    <div className="container-fluid page-body-wrapper p-4" style={{ background: "linear-gradient(to right, #whitemimo)" }}>
      {/* Top row: CPU, RAM, Disk */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <CpuCard data={metrics.cpu} />
        </div>
        <div className="col-md-4 mb-3">
          <RamCard data={metrics.ram} />
        </div>
        <div className="col-md-4 mb-3">
          <DiskCard data={metrics.disk} />
        </div>
      </div>

      {/* Middle row: GPU and side cards */}
      <div className="row">
        <div className="col-md-8 mb-3">
          <CombinedUsageCard gpuData={metrics.gpu} gpuMemData={metrics.gpuMem} labels={labels} />
        </div>

        <div className="col-md-4 mb-3">
          <div className="mb-3">
            <NetworkCard
              bytesSent={metrics.bytesSent}
              bytesReceived={metrics.bytesReceived}
            />
          </div>
          <BatteryCard
            battery={metrics.battery}
            charging={metrics.charging}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
