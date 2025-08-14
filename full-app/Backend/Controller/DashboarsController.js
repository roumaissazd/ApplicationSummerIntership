const Dashboard = require('../Model/dashboard');

exports.createStats = async (req, res) => {
  try {
    let data = Array.isArray(req.body) ? req.body : [req.body];

    // Nettoyage des données (remplir les champs manquants avec 0)
    data = data.map(d => ({
      timestamp: d.timestamp || new Date(),
      cpu_usage: d.cpu_usage ?? 0,
      memory_percent: d.memory_percent ?? 0,
      memory_total: d.memory_total ?? 0,
      memory_used: d.memory_used ?? 0,
      disk_percent: d.disk_percent ?? 0,
      disk_total: d.disk_total ?? 0,
      disk_used: d.disk_used ?? 0,
      network_rx: d.network_rx ?? 0,
      network_tx: d.network_tx ?? 0,
      load_avg_1min: d.load_avg_1min ?? 0,
      process_count: d.process_count ?? 0
    }));

    const stats = await Dashboard.insertMany(data);
    res.status(201).json({
      message: 'Statistiques ajoutées avec succès',
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout des statistiques :', error);
    res.status(400).json({ message: 'Données invalides', error });
  }
};

// --- Récupérer toutes les stats ---
exports.getStats = async (req, res) => {
  try {
    const stats = await Dashboard.find().sort({ timestamp: -1 });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// --- Récupérer une stat par ID ---
exports.getStatById = async (req, res) => {
  try {
    const stat = await Dashboard.findById(req.params.id);
    if (!stat) {
      return res.status(404).json({ message: 'Statistique non trouvée' });
    }
    res.json(stat);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// --- Supprimer une stat ---
exports.deleteStat = async (req, res) => {
  try {
    const stat = await Dashboard.findByIdAndDelete(req.params.id);
    if (!stat) {
      return res.status(404).json({ message: 'Statistique non trouvée' });
    }
    res.json({ message: 'Statistique supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};