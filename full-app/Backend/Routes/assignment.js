const express = require('express');
const router = express.Router();
const assignmentController = require('../Controller/AssignmentController');

router.post('/', assignmentController.createAssignment);
router.get('/', assignmentController.getAllAssignments);
router.get('/week', assignmentController.getAssignmentsByWeek);
router.get('/technician/:technicianId', assignmentController.getAssignmentsByTechnician);
router.put('/:id', assignmentController.updateAssignment);
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;
