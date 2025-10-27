const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  status: { type: String, enum: ['assigned', 'in-progress', 'completed'], default: 'assigned' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);