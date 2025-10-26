import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function NetworkCard({ bytesSent, bytesReceived }) {
  const chartData = {
    labels: ["Network Traffic"],
    datasets: [
      {
        label: "Bytes Sent",
        data: [bytesSent / 1000],
        backgroundColor: "rgba(75,192,192,0.7)",
      },
      {
        label: "Bytes Received",
        data: [bytesReceived / 1000],
        backgroundColor: "rgba(153,102,255,0.7)",
      },
    ],
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg p-6 chart-card-medium">
      <h3 className="text-lg font-semibold mb-3 text-black">Network Activity (KB)</h3>
      <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
    </div>
  );
}

export default NetworkCard;
