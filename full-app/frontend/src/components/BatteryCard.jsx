import React, { useEffect, useState } from "react";

function BatteryCard({ style, title }) {
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [charging, setCharging] = useState(false);

  useEffect(() => {
    if ("getBattery" in navigator) {
      navigator.getBattery().then((battery) => {
        const updateBatteryInfo = () => {
          const level = battery.level * 100;
          setBatteryLevel(level);
          setCharging(battery.charging);
        };

        updateBatteryInfo();

        battery.addEventListener("levelchange", updateBatteryInfo);
        battery.addEventListener("chargingchange", updateBatteryInfo);

        return () => {
          battery.removeEventListener("levelchange", updateBatteryInfo);
          battery.removeEventListener("chargingchange", updateBatteryInfo);
        };
      });
    }
  }, []);

  // Déterminer la couleur
  const batteryColor =
    batteryLevel < 20 ? "red" : batteryLevel < 50 ? "orange" : "green";

  return (
    <div
      className="rounded-2xl shadow-lg p-5 flex flex-col items-center justify-center"
      style={{
        ...style,
        backdropFilter: "blur(8px)",
        background: style?.background || "rgba(50,50,50,0.7)",
      }}
    >
      <h3 className="text-lg font-semibold mb-3 text-white">{title || "Battery Status"}</h3>

      <div className="battery-container relative w-16 h-40 border-2 border-white rounded-lg flex flex-col justify-end">
        <div
          className="absolute bottom-0 w-full rounded-b-md transition-all duration-500"
          style={{
            height: `${batteryLevel}%`,
            backgroundColor: batteryColor,
          }}
        ></div>
        <div className="battery-cap absolute top-[-10px] w-3 h-2 bg-white rounded-sm"></div>
        <span className="absolute w-full text-center text-white font-bold top-1/2 transform -translate-y-1/2">
          {Math.round(batteryLevel)}%
        </span>
      </div>

      {charging && <p className="text-green-400 mt-2 font-medium">⚡ Charging</p>}
    </div>
  );
}

export default BatteryCard;
