const express = require('express');
const cors = require('cors');
const {protect} = require('./middlewares/auth');
const authRoutes = require('./routes/auth');
const cultivationPlanRoutes = require('./routes/cultivationPlan');
const cropRoutes = require('./routes/crop')
const diseaseRoutes = require('./routes/disease')
const detectedDiseaseRoutes = require('./routes/detectedDisease')
const chatRoutes = require('./routes/chat');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cultivationPlan', cultivationPlanRoutes);
app.use('/api/crop',cropRoutes)
app.use('/api/disease',diseaseRoutes)
app.use('/api/detectedDisease',detectedDiseaseRoutes)
app.use('/api/chat', chatRoutes);



// Protected route example
app.get('/api/profile', protect, (req, res) => {
  res.json({ user: req.user });
});

// Basic route
app.get('/a', (req, res) => {
  res.json({ message: 'Smart Agriculture API is running!' });
});

module.exports=app;
