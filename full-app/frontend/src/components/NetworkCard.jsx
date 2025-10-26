import React, { useState, useEffect } from "react";

function NetworkCard({ bytesSent, bytesReceived }) {
  const [connectionStatus, setConnectionStatus] = useState('online');

  useEffect(() => {
    // Simulate connection status changes
    const interval = setInterval(() => {
      setConnectionStatus(Math.random() > 0.95 ? 'offline' : 'online');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatSpeed = (bytes) => {
    const mbps = (bytes * 8) / 1000000; // Convert to Mbps
    return mbps.toFixed(2);
  };

  const getStatusColor = () => {
    return connectionStatus === 'online' ? 'text-accent-green' : 'text-accent-red';
  };

  const getStatusIcon = () => {
    return connectionStatus === 'online' ? '📶' : '📵';
  };

  return (
    <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6 chart-card-medium hover:shadow-glow hover:scale-105 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-text-primary font-sans">Network Activity</h3>
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          <span className="text-lg">{getStatusIcon()}</span>
          <span className="text-sm font-medium font-sans capitalize">{connectionStatus}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Upload Speed */}
        <div className="bg-dark-secondary/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary font-sans">Upload</span>
            <span className="text-sm font-mono font-semibold text-accent-cyan">
              {formatSpeed(bytesSent)} Mbps
            </span>
          </div>
          <div className="w-full bg-dark-tertiary rounded-full h-2">
            <div
              className="bg-gradient-to-r from-accent-cyan to-accent-blue h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((bytesSent / 1000000) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Download Speed */}
        <div className="bg-dark-secondary/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary font-sans">Download</span>
            <span className="text-sm font-mono font-semibold text-accent-purple">
              {formatSpeed(bytesReceived)} Mbps
            </span>
          </div>
          <div className="w-full bg-dark-tertiary rounded-full h-2">
            <div
              className="bg-gradient-to-r from-accent-purple to-accent-pink h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((bytesReceived / 1000000) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Network Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-secondary/50 rounded-lg p-3 text-center">
            <div className="text-xs text-text-secondary font-sans mb-1">Type</div>
            <div className="text-sm font-mono font-semibold text-text-primary">WiFi</div>
          </div>
          <div className="bg-dark-secondary/50 rounded-lg p-3 text-center">
            <div className="text-xs text-text-secondary font-sans mb-1">Ping</div>
            <div className="text-sm font-mono font-semibold text-accent-green">23 ms</div>
          </div>
        </div>

        {/* Animated Network Waves */}
        <div className="flex justify-center space-x-1 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-1 bg-accent-blue rounded-full animate-pulse`}
              style={{
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1.5s'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NetworkCard;
