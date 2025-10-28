// app.js
require('dotenv').config({ debug: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const dashboardRoutes = require('./Routes/Dashboard');
const userRoutes = require('./Routes/User');
const machineRoutes = require('./Routes/machine');
const assignmentRoutes = require('./Routes/assignment');
const chatRoutes = require('./Routes/chat');
const predictionRoutes = require('./Routes/prediction'); // Ajout de la route de prédiction
const chatSocket = require('./socket/chatSocket');
const NotificationService = require('./services/notificationService');
const PredictionService = require('./services/predictionService'); // Importer le service de prédiction

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dashboardDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Initialize NotificationService with socket.io instance
try {
  console.log('Initializing NotificationService...');
  NotificationService.init(io); // Pass io instead of server
} catch (err) {
  console.error('Error initializing NotificationService:', err);
  process.exit(1);
}

// Initialize Prediction Service
try {
  console.log('Initializing PredictionService...');
  PredictionService.init();
} catch (err) {
  console.error('Error initializing PredictionService:', err);
}

// Initialize chatSocket with socket.io instance
try {
  console.log('Initializing chatSocket...');
  chatSocket(io);
} catch (err) {
  console.error('Error initializing chatSocket:', err);
  process.exit(1);
}

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Le serveur fonctionne correctement!' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/predictions', predictionRoutes); // Utilisation de la route de prédiction

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 5002;
server.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});