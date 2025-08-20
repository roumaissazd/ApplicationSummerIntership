const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'viewer'],
    default: 'user',
  },
  firstName: {
    type: String,
    trim: true,
    required: [true, 'First name is required'],
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, 'Last name is required'],
  },
  faceIdPhoto: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  // === Champs pour le code OTP ===
  resetPasswordCode: String,       // Stocke le hash du code à 6 chiffres
  resetPasswordExpires: Date,      // Expiration du code

}, {
  timestamps: true,
});

// Hash password avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Méthode pour comparer le mot de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer un code OTP
userSchema.methods.createPasswordResetCode = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 chiffres
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

  this.resetPasswordCode = hashedCode;
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

  return code; // Retourne le code clair pour l'envoyer par email
};

module.exports = mongoose.model('User', userSchema);
