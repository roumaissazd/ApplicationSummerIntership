// controllers/userController.js

const User = require('../Model/User');
const authenticate = require('../middlewares/auth');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const csv = require('csv-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const EmailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// === Générer un token JWT ===
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
};

// === Créer le premier admin ===
exports.createInitialAdmin = async (req, res) => {
  try {
    const { email, password, firstName = '', lastName = '' } = req.body;

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(403).json({ error: 'Admin already exists. Please log in.' });
    }

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const newAdmin = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role: 'admin',
    });

    res.status(201).json({
      message: 'Initial admin created successfully',
      user: { id: newAdmin._id, email: newAdmin.email, role: newAdmin.role },
    });
  } catch (err) {
    console.error('Error creating initial admin:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// === Créer un admin avec limite (max 10) ===
exports.createAdminWithLimit = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create admins' });
    }

    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount >= 10) {
      return res.status(400).json({ error: 'Admin user limit reached (max 10)' });
    }

    const { email, password, firstName = '', lastName = '' } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const admin = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role: 'admin',
    });

    res.status(201).json({
      message: 'Admin created successfully',
      user: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error('Error creating admin:', err);
    res.status(500).json({ error: err.message });
  }
};

// === Créer un utilisateur ===
exports.createUser = async (req, res) => {
  try {
    const { email, password, firstName = '', lastName = '', role = 'user' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let faceIdPhoto = '';
    if (req.file) {
      faceIdPhoto = `/uploads/${req.file.filename}`;
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role,
      faceIdPhoto,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(400).json({ error: err.message });
  }
};

// === Login utilisateur (reconnaissance faciale + fallback mot de passe) ===
exports.loginUser = async (req, res) => {
  try {
    const { email, password, frame } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // --- Tentative login par reconnaissance faciale ---
    if (frame && user.faceIdPhoto) {
      try {
        const sessionResponse = await axios.post('http://localhost:5000/api/start-recognition', {
          user_id: user._id,
        });

        const { session_id } = sessionResponse.data;
        const verifyResponse = await axios.post('http://localhost:5000/api/verify-face', {
          session_id,
          frame,
        });

        if (verifyResponse.data.authenticated) {
          user.lastLogin = Date.now();
          await user.save();
          const token = generateToken(user);
          return res.status(200).json({
            message: 'Login successful via face recognition',
            user: { id: user._id, email: user.email, role: user.role },
            token,
          });
        }
        if (verifyResponse.data.fallback_required) {
          if (!password) return res.status(400).json({ error: 'Password required as fallback' });
          const isMatch = await user.comparePassword(password);
          if (!isMatch) return res.status(401).json({ error: 'Invalid password' });
          user.lastLogin = Date.now();
          await user.save();
          const token = generateToken(user);
          return res.status(200).json({
            message: 'Login fallback via password',
            user: { id: user._id, email: user.email, role: user.role },
            token,
          });
        }
        return res.status(401).json({ error: verifyResponse.data.message });
      } catch (err) {
        console.error('Face recognition service error:', err.message);
        return res.status(500).json({ error: 'Face recognition service unavailable' });
      }
    }

    // --- Login classique par mot de passe ---
    if (!password) return res.status(400).json({ error: 'Password required' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    user.lastLogin = Date.now();
    await user.save();
    const token = generateToken(user);
    return res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, email: user.email, role: user.role },
      token,
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// === Voir profil connecté ===
exports.viewProfile = [
  authenticate,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.status(200).json({ user });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },
];

// === Mise à jour utilisateur (photo visage incluse) ===
exports.updateUser = [
  authenticate,
  async (req, res) => {
    try {
      const userId = req.params.id || req.user.id;
      const updates = {};
      const allowedFields = ['email', 'firstName', 'lastName', 'role', 'isActive'];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

      if (req.file) {
        updates.faceIdPhoto = `/uploads/${req.file.filename}`;
      }

      if (
        (updates.role || updates.isActive !== undefined) &&
        (!req.user || req.user.role !== 'admin')
      ) {
        return res.status(403).json({ error: 'Seul un admin peut modifier le rôle ou l’état' });
      }

      const user = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      }).select('-password');

      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

      res.status(200).json({ message: 'Utilisateur mis à jour', user });
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(400).json({ error: err.message });
    }
  },
];

// === Supprimer un utilisateur (admin only) ===
exports.deleteUser = [
  authenticate,
  async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can delete users' });
      }

      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(400).json({ error: err.message });
    }
  },
];

// === Voir tous les utilisateurs ===
exports.getAllUsers = [
  authenticate,
  async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.status(200).json({ users });
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(400).json({ error: err.message });
    }
  },
];

// === Voir un utilisateur par ID ===
exports.getUserById = [
  authenticate,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.status(200).json({ user });
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(400).json({ error: err.message });
    }
  },
];

// === Logout utilisateur ===
exports.logoutUser = [
  authenticate,
  async (req, res) => {
    try {
      res.status(200).json({ message: 'Déconnexion réussie' });
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      res.status(500).json({ error: 'Erreur serveur lors de la déconnexion' });
    }
  }
];

// === Import CSV ===
exports.importCSV = (req, res) => {
  const results = [];
  const filePath = './uploads/data.csv';
  
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log('CSV importé :', results);
      res.status(200).json({ success: true, data: results });
    })
    .on('error', (err) => {
      res.status(500).json({ success: false, error: err.message });
    });
};

// === Mot de passe oublié ===
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    // Génère un code OTP et stocke son hash
    const code = user.createPasswordResetCode(); 
    await user.save();

    // Contenu email
    const emailHtml = `
      <h2>Réinitialisation de mot de passe</h2>
      <p>Votre code de réinitialisation est :</p>
      <h1>${code}</h1>
      <p>Ce code est valide pendant 15 minutes.</p>
    `;

    // Envoie l'email
    await EmailService.sendEmail(email, 'Code de réinitialisation', emailHtml);

    res.status(200).json({ message: 'Code de réinitialisation envoyé par email' });
  } catch (error) {
    console.error('Erreur forgotPassword:', error.message);
    res.status(500).json({ error: 'Erreur serveur lors de l’envoi du code' });
  }
};

// === Réinitialiser mot de passe ===
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur resetPassword:', error.message, error.stack);
    return res.status(500).json({ error: `Erreur serveur : ${error.message}` });
  }
};
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: "Email, code et nouveau mot de passe requis" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password +resetPasswordCode +resetPasswordExpires");

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    if (user.resetPasswordCode !== hashedCode || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: "Code invalide ou expiré" });
    }

    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès !" });
  } catch (error) {
    console.error("Erreur resetPasswordWithCode:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
