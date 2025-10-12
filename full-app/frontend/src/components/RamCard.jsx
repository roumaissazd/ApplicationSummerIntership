import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement);

function RamCard({ data }) {
  const chartData = {
    labels: ["RAM Usage"],
    datasets: [
      {
        label: "Used (%)",
        data: [data],
        backgroundColor: "rgba(54, 162, 235, 0.8)",
      },
    ],
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg p-5 chart-card-small">
      <h3 className="text-lg font-semibold mb-3 text-black">RAM Usage</h3>
      <Bar data={chartData} options={{ scales: { y: { min: 0, max: 100 } } }} />
      <p className="text-center mt-3 font-medium text-white">{data}%</p>
    </div>
  );
}

export default RamCard;
