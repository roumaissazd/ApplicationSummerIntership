import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const machines = [
  {
    id: 1,
    name: 'Machine A',
    status: 'online',
    cpu: 45,
    ram: 67,
    location: 'Server Room A1',
    lastSeen: '2 min ago'
  },
  {
    id: 2,
    name: 'Machine B',
    status: 'online',
    cpu: 23,
    ram: 45,
    location: 'Server Room B2',
    lastSeen: '1 min ago'
  },
  {
    id: 3,
    name: 'Machine C',
    status: 'warning',
    cpu: 89,
    ram: 92,
    location: 'Server Room C3',
    lastSeen: '5 min ago'
  },
  {
    id: 4,
    name: 'Machine D',
    status: 'offline',
    cpu: 0,
    ram: 0,
    location: 'Server Room D4',
    lastSeen: '1 hour ago'
  },
];

const Home = () => {
  const [animatedCounters, setAnimatedCounters] = useState({});

  useEffect(() => {
    // Animate counters on load
    const timer = setTimeout(() => {
      setAnimatedCounters({
        total: machines.length,
        online: machines.filter(m => m.status === 'online').length,
        warning: machines.filter(m => m.status === 'warning').length,
        offline: machines.filter(m => m.status === 'offline').length,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-accent-green';
      case 'warning': return 'text-accent-yellow';
      case 'offline': return 'text-accent-red';
      default: return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return '🟢';
      case 'warning': return '🟡';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

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

        {/* Machine Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {machines.map((machine, index) => (
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

              {/* Location */}
              <p className="text-text-secondary font-sans text-sm mb-4">
                📍 {machine.location}
              </p>

              {/* Metrics */}
              {machine.status !== 'offline' && (
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
                to="/dashboard"
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
    </div>
  );
};

export default Home;
