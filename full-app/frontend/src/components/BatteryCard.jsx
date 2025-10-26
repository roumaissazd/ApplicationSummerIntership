import React, { useEffect, useState } from "react";

function BatteryCard({ battery, charging, style, title }) {
  const [batteryLevel, setBatteryLevel] = useState(battery || 100);
  const [isCharging, setIsCharging] = useState(charging || false);

  useEffect(() => {
    if ("getBattery" in navigator && !battery) {
      navigator.getBattery().then((battery) => {
        const updateBatteryInfo = () => {
          const level = battery.level * 100;
          setBatteryLevel(level);
          setIsCharging(battery.charging);
        };

        updateBatteryInfo();

        battery.addEventListener("levelchange", updateBatteryInfo);
        battery.addEventListener("chargingchange", updateBatteryInfo);

        return () => {
          battery.removeEventListener("levelchange", updateBatteryInfo);
          battery.removeEventListener("chargingchange", updateBatteryInfo);
        };
      });
    } else {
      setBatteryLevel(battery);
      setIsCharging(charging);
    }
  }, [battery, charging]);

  // Déterminer la couleur avec gradient
  const getBatteryGradient = () => {
    if (batteryLevel < 20) return "linear-gradient(180deg, #ef4444, #dc2626)";
    if (batteryLevel < 50) return "linear-gradient(180deg, #f59e0b, #d97706)";
    return "linear-gradient(180deg, #10b981, #059669)";
  };

  const isLowBattery = batteryLevel < 20;

  return (
    <div
      className={`rounded-2xl shadow-glass p-6 flex flex-col items-center justify-center backdrop-blur-md border border-glass-border transition-all duration-300 hover:shadow-glow hover:scale-105 ${
        isLowBattery ? 'animate-pulse-slow' : ''
      }`}
      style={{
        ...style,
        background: style?.background || "rgba(255, 255, 255, 0.05)",
      }}
    >
      <h3 className="text-lg font-semibold mb-4 text-text-primary font-sans">{title || "Battery Status"}</h3>

      <div className="battery-container relative w-20 h-48 border-2 border-glass-border rounded-lg flex flex-col justify-end overflow-hidden">
        <div
          className="absolute bottom-0 w-full rounded-b-md transition-all duration-1000 ease-out"
          style={{
            height: `${batteryLevel}%`,
            background: getBatteryGradient(),
            boxShadow: isCharging ? '0 0 20px rgba(16, 185, 129, 0.6)' : 'none',
          }}
        ></div>
        <div className="battery-cap absolute top-[-12px] left-1/2 transform -translate-x-1/2 w-4 h-3 bg-glass-border rounded-sm"></div>
        <span className="absolute w-full text-center text-text-primary font-bold font-mono top-1/2 transform -translate-y-1/2 text-lg">
          {Math.round(batteryLevel)}%
        </span>
      </div>

      {isCharging && (
        <div className="mt-4 flex items-center space-x-2">
          <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
          <p className="text-accent-green font-medium font-sans">⚡ Charging</p>
        </div>
      )}

      {isLowBattery && !isCharging && (
        <div className="mt-4 flex items-center space-x-2">
          <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse"></div>
          <p className="text-accent-red font-medium font-sans">Low Battery</p>
        </div>
      )}
    </div>
  );
}

export default BatteryCard;
