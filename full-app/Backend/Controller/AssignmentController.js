const Assignment = require('../Model/Assignment');
const User = require('../Model/User');
const Machine = require('../Model/Machine');
const EmailService = require('../services/emailService'); 

// Créer une assignation (admin only)
exports.createAssignment = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Seuls les administrateurs peuvent créer des assignations.' });
  }

  try {
    const { technicianId, machineId, day, description } = req.body;

    if (!technicianId || !machineId || !day) {
      return res.status(400).json({ error: 'Technicien, machine et date sont requis.' });
    }

    const technician = await User.findById(technicianId);
    const machine = await Machine.findById(machineId);

    if (!technician) return res.status(404).json({ error: 'Technicien non trouvé' });
    if (!machine) return res.status(404).json({ error: 'Machine non trouvée' });

    const assignment = await Assignment.create({
      technician: technicianId,
      machine: machineId,
      weekStart: new Date(day),
      weekEnd: new Date(day),
      notes: description || ''
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('technician', 'firstName lastName email')
      .populate('machine', 'name serialNumber');

    // === ENVOI D'EMAIL AU TECHNICIEN ===
    const techEmail = populatedAssignment.technician.email;
    const formattedDate = new Date(day).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #007bff;">Nouvelle assignation</h2>
        <p>Bonjour <strong>${populatedAssignment.technician.firstName} ${populatedAssignment.technician.lastName}</strong>,</p>
        <p>Vous avez été assigné à une nouvelle tâche de maintenance :</p>
        
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date :</strong></td>
            <td style="padding: 8px;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Machine :</strong></td>
            <td style="padding: 8px;">${populatedAssignment.machine.name} (${populatedAssignment.machine.serialNumber})</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Description :</strong></td>
            <td style="padding: 8px;">${description || 'Aucune description fournie'}</td>
          </tr>
        </table>

        <p style="margin-top: 20px;">Veuillez vous connecter à l'application pour consulter les détails.</p>
        <p style="color: #666; font-size: 12px;">Cet email est automatique. Ne pas répondre.</p>
      </div>
    `;

    try {
      await EmailService.sendEmail(
        techEmail,
        `Nouvelle assignation - ${populatedAssignment.machine.name}`,
        htmlContent
      );
      console.log(`Email envoyé à ${techEmail}`);
    } catch (emailErr) {
      console.error("Échec envoi email:", emailErr.message);
      // Ne bloque pas la création si l'email échoue
    }

    res.status(201).json(populatedAssignment);
  } catch (err) {
    console.error("Error in createAssignment:", err);
    res.status(500).json({ error: err.message });
  }
};

// Lister toutes les assignations
// Lister toutes les assignations (seulement pour admin)
exports.getAllAssignments = async (req, res) => {
  try {
    // Vérifier le rôle de l'utilisateur
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Admin requis.' });
    }

    const assignments = await Assignment.find()
      .populate('technician', 'firstName lastName email role')
      .populate('machine', 'name serialNumber');
    
    res.json(assignments);
  } catch (err) {
    console.error("Error in getAllAssignments:", err);
    res.status(500).json({ error: err.message });
  }
};
// Lister les assignations d’un technicien (user ou admin)
exports.getAssignmentsByTechnician = async (req, res) => {
  try {
    const { technicianId } = req.params;

    // Sécurité : un user ne peut voir que ses propres assignations
    if (req.user.role !== 'admin' && req.user.id !== technicianId) {
      return res.status(403).json({ error: 'Vous ne pouvez voir que vos propres assignations.' });
    }

    const assignments = await Assignment.find({ technician: technicianId })
      .populate('technician', 'firstName lastName email role')
      .populate('machine', 'name serialNumber');
    
    res.json(assignments);
  } catch (err) {
    console.error("Error in getAssignmentsByTechnician:", err);
    res.status(500).json({ error: err.message });
  }
};
// Récupérer les assignations du technicien connecté
exports.getMyAssignments = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });

    const assignments = await Assignment.find({ technician: req.user.id })
      .populate('technician', 'firstName lastName email role')
      .populate('machine', 'name serialNumber');

    res.json(assignments);
  } catch (err) {
    console.error("getMyAssignments error:", err);
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
