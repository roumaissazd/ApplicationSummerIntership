// Routes/prediction.js
const express = require('express');
const router = express.Router();
const predictionController = require('../Controller/PredictionController');
const authenticate = require('../middlewares/auth');

router.get('/', authenticate, predictionController.getLatestPredictions);

module.exports = router;