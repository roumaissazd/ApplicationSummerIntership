// src/pages/RiskPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const RiskGauge = ({ percentage }) => {
  const getStyle = (p) => {
    if (p > 80) return { color: 'text-red-500', bg: 'bg-red-500' };
    if (p > 40) return { color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { color: 'text-green-500', bg: 'bg-green-500' };
  };
  const style = getStyle(percentage);
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle className="text-gray-300" strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="60" cy="60" />
        <circle className={style.color} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="50" cx="60" cy="60" transform="rotate(-90 60 60)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-3xl font-bold ${style.color}`}>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

const RiskPage = () => {
  const [history, setHistory] = useState({});
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5001/api/predictions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.history || {});
        const latestPreds = Object.keys(data.history || {}).map(comp => {
          const arr = data.history[comp];
          return arr[arr.length - 1];
        });
        setLatest(latestPreds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const chartData = (comp, color) => {
    const points = (history[comp] || []).map(p => ({ x: new Date(p.createdAt), y: p.risk_percent }));
    return {
      datasets: [{
        data: points,
        borderColor: color,
        backgroundColor: `${color}33`,
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { type: 'time', time: { unit: 'minute' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.1)' } }
    },
    plugins: { legend: { display: false } }
  };

  const colors = { CPU: '#3b82f6', Memory: '#a855f7', Disk: '#22c55e' };

  if (loading) return <div className="text-center p-10 text-white">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/dashboard" className="flex items-center text-blue-400 hover:underline mb-6">
          <ArrowLeft className="mr-2" /> Retour
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">Prédictions de Panne (IA)</h1>
        <p className="text-gray-300 mb-8">Analyse en temps réel des risques système</p>

        <div className="grid gap-8 md:grid-cols-3">
          {latest.map((pred) => (
            <div key={pred._id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">{pred.component}</h3>
              <RiskGauge percentage={pred.risk_percent} />
              <p className="mt-4 text-sm text-gray-300">{pred.message}</p>
              <div className="h-40 mt-6">
                <Line data={chartData(pred.component, colors[pred.component])} options={chartOptions} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskPage;