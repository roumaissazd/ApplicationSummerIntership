// controllers/machineController.js
const Machine = require('../Model/Machine');
const authenticate = require('../middlewares/auth');

// Récupérer toutes les machines créées par l'admin connecté
exports.getMachinesByCreator = [
  authenticate,
  async (req, res) => {
    try {
      console.log("Utilisateur connecté:", req.user.id, "Rôle:", req.user.role);
      
      // Si l'utilisateur est un admin, il voit ses machines ET celles sans créateur
      // Si l'utilisateur a un autre rôle, il voit toutes les machines
      let filter = {};
      
      if (req.user.role === 'admin') {
        // Admin voit ses machines + celles sans créateur
        filter = {
          $or: [
            { createdBy: req.user.id },
            { createdBy: { $exists: false } },
            { createdBy: null }
          ]
        };
      }
      // Les autres rôles voient toutes les machines (pas de filtre)

      const machines = await Machine.find(filter).sort({ createdAt: -1 });
      console.log("Machines trouvées:", machines.length);
      res.status(200).json({ machines });
    } catch (error) {
      console.error('Error fetching machines:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
];

// Créer une nouvelle machine
exports.createMachine = [
  authenticate,
  async (req, res) => {
    try {
      const { name, serialNumber, model, description, location, status } = req.body;
      
      console.log("Données reçues:", req.body);
      console.log("ID utilisateur:", req.user.id);

      // Validation des données requises
      if (!name || !serialNumber) {
        return res.status(400).json({ error: 'Le nom et le numéro de série sont requis' });
      }

      // Vérifier si une machine avec ce numéro de série existe déjà
      const existingMachine = await Machine.findOne({ serialNumber });
      if (existingMachine) {
        return res.status(400).json({ error: 'Une machine avec ce numéro de série existe déjà' });
      }

      // Ajouter l'ID de l'utilisateur connecté comme créateur
      const machineData = {
        name,
        serialNumber,
        model: model || '',
        description: description || '',
        location: location || '',
        status: status || 'active',
        createdBy: req.user.id
      };

      const machine = await Machine.create(machineData);
      console.log("Machine créée:", machine);
      res.status(201).json({ machine });
    } catch (error) {
      console.error('Error creating machine:', error);
      res.status(400).json({ error: error.message });
    }
  }
];

// Récupérer toutes les machines
exports.getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 });
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une machine par ID
exports.getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine non trouvée' });
    }
    res.json(machine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une machine
exports.updateMachine = async (req, res) => {
  try {
    const machine = await Machine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!machine) {
      return res.status(404).json({ error: 'Machine non trouvée' });
    }
    res.json({
      message: 'Machine mise à jour avec succès',
      machine
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une machine
exports.deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine non trouvée' });
    }
    res.json({ message: 'Machine supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};