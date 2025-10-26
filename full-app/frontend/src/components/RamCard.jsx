import React from "react";

function RamCard({ data }) {
  const totalRam = 16; // GB
  const usedRam = (data / 100) * totalRam;

  // Simulated memory usage breakdown
  const memoryBreakdown = [
    { process: "System", usage: Math.round(data * 0.3), color: "bg-accent-blue" },
    { process: "Chrome", usage: Math.round(data * 0.25), color: "bg-accent-green" },
    { process: "VS Code", usage: Math.round(data * 0.2), color: "bg-accent-purple" },
    { process: "Other", usage: Math.round(data * 0.25), color: "bg-accent-cyan" },
  ];

  const ramSpeed = 3200; // MHz
  const ramType = "DDR4";

  return (
    <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6 chart-card-small hover:shadow-glow hover:scale-105 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4 text-text-primary font-sans">RAM Usage</h3>

      {/* Memory Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-secondary font-sans">Used</span>
          <span className="text-sm font-mono font-semibold text-text-primary">
            {usedRam.toFixed(1)} / {totalRam} GB
          </span>
        </div>
        <div className="w-full bg-dark-tertiary rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-accent-blue to-accent-cyan h-3 rounded-full transition-all duration-1000"
            style={{ width: `${data}%` }}
          ></div>
        </div>
      </div>

      {/* Memory Breakdown */}
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-semibold text-text-primary font-sans mb-2">Top Processes</h4>
        {memoryBreakdown.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-xs text-text-secondary font-sans">{item.process}</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-dark-tertiary rounded-full h-1">
                <div
                  className={`${item.color} h-1 rounded-full transition-all duration-1000`}
                  style={{ width: `${(item.usage / data) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-mono text-text-primary w-8 text-right">{item.usage}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* RAM Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-secondary/50 rounded-lg p-3 text-center">
          <div className="text-xs text-text-secondary font-sans mb-1">Speed</div>
          <div className="text-sm font-mono font-semibold text-text-primary">{ramSpeed} MHz</div>
        </div>
        <div className="bg-dark-secondary/50 rounded-lg p-3 text-center">
          <div className="text-xs text-text-secondary font-sans mb-1">Type</div>
          <div className="text-sm font-mono font-semibold text-text-primary">{ramType}</div>
        </div>
      </div>
    </div>
  );
}

export default RamCard;
