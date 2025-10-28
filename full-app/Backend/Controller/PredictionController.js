// Controller/PredictionController.js
const Prediction = require('../Model/Prediction');

exports.getLatestPredictions = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const predictions = await Prediction.find({
      createdAt: { $gte: twentyFourHoursAgo }
    }).sort({ createdAt: 'asc' });

    const grouped = predictions.reduce((acc, p) => {
      acc[p.component] = acc[p.component] || [];
      acc[p.component].push(p);
      return acc;
    }, {});

    res.status(200).json({ history: grouped });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Erreur récupération prédictions', details: error.message });
  }
};