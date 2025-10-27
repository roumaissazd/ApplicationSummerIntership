const express = require('express');
const router = express.Router();
const assignmentController = require('../Controller/AssignmentController');

// Créer une assignation
router.post('/', assignmentController.createAssignment);

// Récupérer toutes les assignations (admin)
router.get('/', assignmentController.getAllAssignments);

// Récupérer les assignations d'un technicien (user)
router.get('/technician/:technicianId', assignmentController.getAssignmentsByTechnician);

// Mettre à jour une assignation
router.put('/:id', assignmentController.updateAssignment);

// Supprimer une assignation
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;