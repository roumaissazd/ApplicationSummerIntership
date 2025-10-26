import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function DiskCard({ data }) {
  const totalSpace = 512; // GB
  const usedSpace = (data / 100) * totalSpace;
  const freeSpace = totalSpace - usedSpace;

  const readSpeed = Math.round(data * 0.5 + 50); // MB/s
  const writeSpeed = Math.round(data * 0.3 + 30); // MB/s

  const chartData = {
    labels: ["Used", "Free"],
    datasets: [
      {
        data: [usedSpace, freeSpace],
        backgroundColor: [
          data > 90 ? "rgba(239, 68, 68, 0.8)" : data > 70 ? "rgba(245, 158, 11, 0.8)" : "rgba(59, 130, 246, 0.8)",
          "rgba(255, 255, 255, 0.1)",
        ],
        borderColor: [
          data > 90 ? "#ef4444" : data > 70 ? "#f59e0b" : "#3b82f6",
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
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.toFixed(1)} GB`;
          }
        }
      },
    },
  };

  return (
    <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6 chart-card-small hover:shadow-glow hover:scale-105 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4 text-text-primary font-sans">Disk Usage</h3>

      <div className="relative w-32 h-32 mx-auto mb-4">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-text-primary font-mono">{data}%</span>
          <span className="text-xs text-text-secondary font-sans">Used</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary font-sans">Total</span>
          <span className="text-sm font-mono font-semibold text-text-primary">{totalSpace} GB</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary font-sans">Used</span>
          <span className="text-sm font-mono font-semibold text-text-primary">{usedSpace.toFixed(1)} GB</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary font-sans">Read</span>
          <span className="text-sm font-mono font-semibold text-accent-cyan">{readSpeed} MB/s</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary font-sans">Write</span>
          <span className="text-sm font-mono font-semibold text-accent-pink">{writeSpeed} MB/s</span>
        </div>
      </div>
    </div>
  );
}

export default DiskCard;
