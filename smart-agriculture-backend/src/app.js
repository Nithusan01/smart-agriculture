const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io'); // Import Server from socket.io
const {protect} = require('./middlewares/auth');
const socketHandler = require('./socket');

// Import routes
const authRoutes = require('./routes/auth');
const cultivationPlanRoutes = require('./routes/cultivationPlan');
const cropRoutes = require('./routes/crop')
const diseaseRoutes = require('./routes/disease')
const detectedDiseaseRoutes = require('./routes/detectedDisease')
const chatRoutes = require('./routes/chat');
const DeviceRoutes = require('./routes/device');
const sensorDataRoutes = require('./routes/sensorData');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Create HTTP server 
const server = http.createServer(app);

// create Socket.io instance with proper config
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'], // Enable both transports
  pingTimeout: 60000, // Increase timeout
  pingInterval: 25000,
  path: '/socket.io/'
});

 
// Initialize socket with the io instance
socketHandler.initSocket(io);

// Make io available to other modules through app
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cultivationPlan', cultivationPlanRoutes);
app.use('/api/crop',cropRoutes)
app.use('/api/disease',diseaseRoutes)
app.use('/api/detectedDisease',detectedDiseaseRoutes)
app.use('/api/chat', chatRoutes);
app.use('/api/device',DeviceRoutes);
app.use('/api/sensor',sensorDataRoutes);


// Protected route example
app.get('/api/profile', protect, (req, res) => {
  res.json({ user: req.user });
});

// Basic route
app.get('/a', (req, res) => {
  res.json({ message: 'Smart Agriculture API is running!' });
});

// WebSocket test endpoint
app.get('/api/ws-test', (req, res) => {
  res.json({ 
    status: 'WebSocket server is running',
    connectedClients: io.engine.clientsCount 
  });
});

// Test WebSocket endpoint
app.post('/api/ws-test/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const testData = req.body || { 
    message: 'Test data',
    timestamp: new Date().toISOString(),
    value: Math.random() * 100 
  };
  
  socketHandler.emitSensorUpdate(deviceId, testData);
  
  res.json({
    success: true,
    message: `Test data sent to device ${deviceId}`,
    data: testData
  });
});

module.exports= {app,server};
