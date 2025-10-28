// Model/Prediction.js
const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  component: { type: String, required: true },
  risk_percent: { type: Number, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Prediction', predictionSchema);