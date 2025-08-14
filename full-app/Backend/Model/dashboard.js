// models/SystemStats.js
const mongoose = require('mongoose');

const dashboard = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  cpu_usage: { type: Number, required: true },
  memory_percent: { type: Number, required: true },
  memory_total: { type: Number, required: true },
  memory_used: { type: Number, required: true },
  disk_percent: { type: Number, required: true },
  disk_total: { type: Number, required: true },
  disk_used: { type: Number, required: true },
  network_rx: { type: Number, required: true },
  network_tx: { type: Number, required: true },
  load_avg_1min: { type: Number, required: true },
  process_count: { type: Number, required: true }
});

module.exports = mongoose.model('dashboard', dashboard);
