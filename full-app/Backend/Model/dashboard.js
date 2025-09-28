const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true, default: Date.now },
  cpu_usage: { type: Number, required: true, default: 0 },
  memory_percent: { type: Number, required: true, default: 0 },
  memory_total: { type: Number, default: 0 }, // Optional, can be derived
  memory_used: { type: Number, default: 0 },  // Optional, can be derived
  disk_percent: { type: Number, required: true, default: 0 },
  disk_total: { type: Number, default: 0 },   // Optional, can be derived
  disk_used: { type: Number, default: 0 },    // Optional, can be derived
  network_rx: { type: Number, required: true, default: 0 },
  network_tx: { type: Number, required: true, default: 0 },
  load_avg_1min: { type: Number, required: true, default: 0 },
  process_count: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model('Dashboard', dashboardSchema);