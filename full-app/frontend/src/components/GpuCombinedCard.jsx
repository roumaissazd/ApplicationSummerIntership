import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Title,
  Filler
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Title, Filler);

function CombinedUsageCard({ gpuData, gpuMemData, labels }) {
  const currentGpuUsage = gpuData[gpuData.length - 1] || 0;
  const currentGpuMemUsage = gpuMemData[gpuMemData.length - 1] || 0;
  const gpuTemp = Math.round(currentGpuUsage * 0.6 + 40); // Simulated temperature
  const vramTotal = 8; // GB
  const vramUsed = (currentGpuMemUsage / 100) * vramTotal;

  const data = {
    labels,
    datasets: [
      {
        label: "GPU Usage (%)",
        data: gpuData,
        borderColor: "rgba(139, 92, 246, 1)",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#8b5cf6",
        pointBorderColor: "#8b5cf6",
        pointHoverBackgroundColor: "#a855f7",
        pointHoverBorderColor: "#a855f7",
      },
      {
        label: "GPU Memory Usage (%)",
        data: gpuMemData,
        borderColor: "rgba(236, 72, 153, 1)",
        backgroundColor: "rgba(236, 72, 153, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#ec4899",
        pointBorderColor: "#ec4899",
        pointHoverBackgroundColor: "#f472b6",
        pointHoverBorderColor: "#f472b6",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#e2e8f0",
          font: {
            family: "Inter",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 15, 35, 0.9)",
        titleColor: "#e2e8f0",
        bodyColor: "#94a3b8",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#94a3b8",
          font: {
            family: "Inter",
            size: 10,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#94a3b8",
          font: {
            family: "Inter",
            size: 10,
          },
        },
      },
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 6,
      },
    },
  };

  return (
    <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6 chart-card-large hover:shadow-glow-purple hover:scale-105 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-text-primary font-sans">GPU Metrics</h2>
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="text-sm text-text-secondary font-sans">Temperature</div>
            <div className={`text-lg font-mono font-semibold ${
              gpuTemp > 80 ? 'text-accent-red' : gpuTemp > 60 ? 'text-accent-yellow' : 'text-accent-green'
            }`}>
              {gpuTemp}°C
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-text-secondary font-sans">VRAM</div>
            <div className="text-lg font-mono font-semibold text-text-primary">
              {vramUsed.toFixed(1)}/{vramTotal} GB
            </div>
          </div>
        </div>
      </div>

      <div className="h-64 mb-4">
        <Line data={data} options={options} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-secondary/50 rounded-lg p-3">
          <div className="text-sm text-text-secondary font-sans mb-1">GPU Model</div>
          <div className="text-sm font-mono font-semibold text-text-primary">RTX 3060</div>
        </div>
        <div className="bg-dark-secondary/50 rounded-lg p-3">
          <div className="text-sm text-text-secondary font-sans mb-1">Driver Version</div>
          <div className="text-sm font-mono font-semibold text-text-primary">516.94</div>
        </div>
      </div>
    </div>
  );
}

export default CombinedUsageCard;
