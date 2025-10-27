require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const socketIo = require('socket.io');
const dashboardRoutes = require('./Routes/Dashboard');
const userRoutes = require('./Routes/User');
const machineRoutes = require('./Routes/machine');
const assignmentRoutes = require('./Routes/assignment');
const chatRoutes = require('./Routes/chat');
const chatSocket = require('./socket/chatSocket');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dashboardDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Socket.IO setup
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Utilisateur connecté:', socket.id);
  
  // Rejoindre une salle de conversation
});

// Initialiser les gestionnaires d'événements Socket.IO pour le chat
chatSocket(io);

  // Ajoutez cette route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Le serveur fonctionne correctement!' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/chat', chatRoutes);



// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});