// Model/Machine.js
const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // ex: 'sensor', 'motor', 'pump', 'heater'
  model: String,
  specifications: mongoose.Schema.Types.Mixed,
  thresholds: {
    low: { type: Number, default: 30 },
    medium: { type: Number, default: 60 },
    high: { type: Number, default: 85 },
    critical: { type: Number, default: 95 }
  },
  unit: { type: String, default: '%' }, // %, °C, RPM, bar, etc.
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' }
});

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  model: String,
  description: String,
  location: String,
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  components: [componentSchema],
  mqttTopic: { type: String, required: true }, // Topic unique pour cette machine
  lastDataReceived: Date,
  overallHealth: { type: Number, min: 0, max: 100, default: 100 }
}, { timestamps: true });

module.exports = mongoose.model('Machine', machineSchema);