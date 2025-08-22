const express = require('express');
const router = express.Router();
const User = require('../Model/User'); // Import du modèle User
const userController = require('../Controller/UserController');
const authenticate = require('../middlewares/auth');
const upload = require('../middlewares/uploads');
const dashboard = require('../Model/dashboard');
const { importCSV } = require('../Controller/UserController');
const sendEmail = require("../services/emailService");


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
router.post('/get-user-by-email', userController.getUserByEmail);

// Route profile BEFORE the /:id route
router.get('/profile', userController.viewProfile);
router.put('/profile', upload.single('faceIdPhoto'), userController.updateUser);

// Routes avec paramètres (doivent être après les routes spécifiques)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', upload.single('faceIdPhoto'), userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Route protégée : création d’admin, accessible uniquement aux admins connectés
router.post('/admin/create', authenticate, userController.createAdminWithLimit);
router.post("/forgot-password", userController.forgotPassword);

router.post('/reset-password/:token', userController.resetPassword);

router.post("/reset-password-code", userController.resetPasswordWithCode);


router.post('/logout', userController.logoutUser); // 🔐 Auth obligatoire

// In your UserController.js or auth.js
exports.viewProfile = async (req, res, next) => {
  try {
    // Your async logic here, e.g., fetching a user from the database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    // If any error occurs in the try block, it's caught here
    console.error('Error in viewProfile:', error);
    // Pass the error to the global error handler in app.js
    next(error);
  }
};
router.get("/sendmail", async (req, res) => {
  try {
    await sendEmail("destinataire@gmail.com", "Test Nodemailer", "Hello, ça marche 🚀 !");
    res.json({ success: true, message: "Email envoyé !" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
