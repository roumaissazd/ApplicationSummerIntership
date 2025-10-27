const express = require('express');
const router = express.Router();
const machineController = require('../Controller/MachineController');

// Routes pour les machines
router.post('/', machineController.createMachine);
router.get('/', machineController.getMachinesByCreator); // Changed to use the new method
router.get('/:id', machineController.getMachineById);
router.put('/:id', machineController.updateMachine);
router.delete('/:id', machineController.deleteMachine);
router.get('/all', machineController.getAllMachines); // Toutes les machines (sans filtre)

module.exports = router;