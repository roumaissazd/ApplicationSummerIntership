// services/predictionService.js
const cron = require('node-cron');
const axios = require('axios');
const Prediction = require('../Model/Prediction');

const PREDICTION_SERVICE_URL = 'http://localhost:5000/api/predict-failure';

const runAndStorePredictions = async () => {
  try {
    console.log('Running prediction job...');
    const response = await axios.get(PREDICTION_SERVICE_URL);

    if (response.status === 200 && response.data.predictions) {
      const predictionsToStore = response.data.predictions.map(p => ({
        component: p.component,
        risk_percent: p.risk_percent,
        message: p.message,
      }));

      if (predictionsToStore.length > 0) {
        await Prediction.deleteMany({}); // Nettoie les anciennes
        await Prediction.insertMany(predictionsToStore);
        console.log(`Stored ${predictionsToStore.length} predictions.`);
      }
    }
  } catch (error) {
    console.error('Error during prediction job:', error.message);
  }
};

exports.init = () => {
  cron.schedule('*/1 * * * *', runAndStorePredictions);
  console.log('Prediction service scheduled every minute.');
};