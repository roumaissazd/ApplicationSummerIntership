const express = require('express');
const router = express.Router();
const assignmentController = require('../Controller/AssignmentController');
const authenticate = require('../middlewares/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Créer une assignation (admin only)
router.post('/', assignmentController.createAssignment);

// Récupérer toutes les assignations (admin only)
router.get('/', assignmentController.getAllAssignments);

// Récupérer MES assignations (user ou admin)
router.get('/my', assignmentController.getMyAssignments);

// Récupérer les assignations d'un technicien (admin ou le technicien)
router.get('/technician/:technicianId', assignmentController.getAssignmentsByTechnician);

// Mettre à jour une assignation (admin only)
router.put('/:id', assignmentController.updateAssignment);

// Supprimer une assignation (admin only)
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;