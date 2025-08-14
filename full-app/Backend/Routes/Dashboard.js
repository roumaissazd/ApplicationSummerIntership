const express = require('express');
const router = express.Router();
const DashboardsController = require('../Controller/DashboarsController');


router.post('/', DashboardsController.createStats);  // Ajouter une ou plusieurs stats
router.get('/', DashboardsController.getStats);     // Récupérer toutes les stats
router.get('/:id', DashboardsController.getStatById); // Récupérer une stat par ID
router.delete('/:id', DashboardsController.deleteStat); // Supprimer une stat
module.exports = router;
