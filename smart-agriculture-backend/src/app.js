const express = require('express');
const cors = require('cors');
const { initSocket } = require('./socket');
const http = require('http');
const {protect} = require('./middlewares/auth');
const authRoutes = require('./routes/auth');
const cultivationPlanRoutes = require('./routes/cultivationPlan');
const cropRoutes = require('./routes/crop')
const diseaseRoutes = require('./routes/disease')
const detectedDiseaseRoutes = require('./routes/detectedDisease')
const chatRoutes = require('./routes/chat');
const DeviceRoutes = require('./routes/device');

const app = express();

// Middleware
// IMPORTANT: Allow ESP32 requests
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});
 
initSocket(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cultivationPlan', cultivationPlanRoutes);
app.use('/api/crop',cropRoutes)
app.use('/api/disease',diseaseRoutes)
app.use('/api/detectedDisease',detectedDiseaseRoutes)
app.use('/api/chat', chatRoutes);
app.use('/api/device',DeviceRoutes);


// Protected route example
app.get('/api/profile', protect, (req, res) => {
  res.json({ user: req.user });
});

// Basic route
app.get('/a', (req, res) => {
  res.json({ message: 'Smart Agriculture API is running!' });
});

module.exports=app;
