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
  Title
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Title);

function CombinedUsageCard({ gpuData, gpuMemData, labels }) {
  const data = {
    labels,
    datasets: [
      {
        label: "GPU Usage (%)",
        data: gpuData,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.4,
        fill: false,
      },
      {
        label: "GPU Memory Usage (%)",
        data: gpuMemData,
        borderColor: "rgba(255,99,132,1)",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg p-6 chart-card-large">
      <h2 className="text-xl font-bold mb-4 text-black">GPU Metrics</h2>
      <Line data={data} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
    </div>
  );
}

export default CombinedUsageCard;
