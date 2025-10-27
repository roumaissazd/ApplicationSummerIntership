// Model/Machine.js
const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Machine name is required'],
    trim: true,
  },
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true,
  },
  model: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active',
  },
  installationDate: {
    type: Date,
  },
  lastMaintenance: {
    type: Date,
  },
  notes: {
    type: String,
    default: '',
  },
  // Ajout du champ pour le créateur
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Rendre ce champ optionnel pour les machines existantes
  }
}, { timestamps: true });

module.exports = mongoose.model('Machine', machineSchema);