import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function CpuCard({ data }) {
  const temperature = Math.round(data * 0.8 + 30); // Simulated temperature based on usage
  const coreCount = 8; // Simulated core count

  const chartData = {
    labels: ["Used", "Available"],
    datasets: [
      {
        data: [data, 100 - data],
        backgroundColor: [
          data > 80 ? "rgba(239, 68, 68, 0.8)" : data > 60 ? "rgba(245, 158, 11, 0.8)" : "rgba(16, 185, 129, 0.8)",
          "rgba(255, 255, 255, 0.1)",
        ],
        borderColor: [
          data > 80 ? "#ef4444" : data > 60 ? "#f59e0b" : "#10b981",
          "rgba(255, 255, 255, 0.2)",
        ],
        borderWidth: 2,
        cutout: "70%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 15, 35, 0.9)",
        titleColor: "#e2e8f0",
        bodyColor: "#94a3b8",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6 chart-card-small hover:shadow-glow hover:scale-105 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4 text-text-primary font-sans">CPU Usage</h3>

      <div className="relative w-32 h-32 mx-auto mb-4">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-text-primary font-mono">{data}%</span>
          <span className="text-xs text-text-secondary font-sans">Usage</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary font-sans">Temperature</span>
          <span className={`text-sm font-mono font-semibold ${
            temperature > 80 ? 'text-accent-red' : temperature > 60 ? 'text-accent-yellow' : 'text-accent-green'
          }`}>
            {temperature}°C
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary font-sans">Cores</span>
          <span className="text-sm font-mono font-semibold text-text-primary">{coreCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary font-sans">Frequency</span>
          <span className="text-sm font-mono font-semibold text-text-primary">3.2 GHz</span>
        </div>
      </div>
    </div>
  );
}

export default CpuCard;
