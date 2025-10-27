const Assignment = require('../Model/Assignment');
const User = require('../Model/User');
const Machine = require('../Model/Machine');

// Créer une assignation
exports.createAssignment = async (req, res) => {
  try {
    const { technicianId, machineId, day, description } = req.body;

    // Vérifier que le technicien et la machine existent
    const technician = await User.findById(technicianId);
    if (!technician) return res.status(404).json({ error: 'Technicien non trouvé' });

    const machine = await Machine.findById(machineId);
    if (!machine) return res.status(404).json({ error: 'Machine non trouvée' });

    if (!day) {
      return res.status(400).json({ error: 'La date d\'assignation est requise' });
    }

    const assignment = await Assignment.create({
      technician: technicianId,
      machine: machineId,
      weekStart: new Date(day),
      weekEnd: new Date(day),
      notes: description
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('technician', 'firstName lastName email role').populate('machine', 'name serialNumber');
    res.status(201).json(populatedAssignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lister toutes les assignations
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('technician', 'firstName lastName email role')
      .populate('machine', 'name serialNumber');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lister les assignations par semaine
exports.getAssignmentsByWeek = async (req, res) => {
  try {
    const { weekStart, weekEnd } = req.query;
    const assignments = await Assignment.find({
      weekStart: { $gte: new Date(weekStart) },
      weekEnd: { $lte: new Date(weekEnd) }
    })
      .populate('technician', 'firstName lastName email role')
      .populate('machine', 'name serialNumber');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour une assignation
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const assignment = await Assignment.findByIdAndUpdate(id, updateData, { new: true })
      .populate('technician', 'firstName lastName email role')
      .populate('machine', 'name serialNumber');
    if (!assignment) return res.status(404).json({ error: 'Assignation non trouvée' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer une assignation
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) return res.status(404).json({ error: 'Assignation non trouvée' });
    res.json({ message: 'Assignation supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lister les assignations d’un technicien
exports.getAssignmentsByTechnician = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const assignments = await Assignment.find({ technician: technicianId })
      .populate('technician', 'firstName lastName email role')
      .populate('machine', 'name serialNumber');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
