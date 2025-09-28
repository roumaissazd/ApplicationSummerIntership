const express = require('express');
const router = express.Router();
const DashboardsController = require('../Controller/DashboarsController');

router.post('/', DashboardsController.createStats);  // Ajouter une ou plusieurs stats
router.get('/', DashboardsController.getStats);     // Récupérer toutes les stats
router.get('/:id', DashboardsController.getStatById); // Récupérer une stat par ID
router.delete('/:id', DashboardsController.deleteStat); // Supprimer une stat
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await Dashboard.find()
      .sort({ timestamp: -1 })
      .limit(100); // Adjust limit as needed
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});
module.exports = router;