const express = require('express');
const router = express.Router();
const User = require('../Model/User'); // Import du modèle User
const userController = require('../Controller/UserController');
const authenticate = require('../middlewares/auth');
const upload = require('../middlewares/uploads');
const dashboard = require('../Model/dashboard');
const { importCSV } = require('../Controller/UserController');


// Route temporaire : création du tout premier admin (NON protégée)
router.post('/admin/init', userController.createInitialAdmin);

// Route pour vérifier si un admin existe (NON protégée)
router.get('/admin/exists', async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    res.json({ adminExists: !!admin });
  } catch (err) {
    console.error('Error in /admin/exists:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Routes publiques
router.post('/register', upload.single('faceIdPhoto'), userController.createUser);
router.post('/login', userController.loginUser);

// Route profile BEFORE the /:id route
router.get('/profile', authenticate, userController.viewProfile);
router.put('/profile', authenticate, upload.single('faceIdPhoto'), userController.updateUser);

// Routes avec paramètres (doivent être après les routes spécifiques)
router.get('/users', authenticate, userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

// Route protégée : création d’admin, accessible uniquement aux admins connectés
router.post('/admin/create', authenticate, userController.createAdminWithLimit);


router.post('/logout', userController.logoutUser); // 🔐 Auth obligatoire



module.exports = router;
