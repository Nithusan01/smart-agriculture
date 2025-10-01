const express = require('express');
const cors = require('cors');
const {protect} = require('./middlewares/auth');
const authRoutes = require('./routes/auth');
const cultivationPlanRoutes = require('./routes/cultivationPlan');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cultivationPlan', cultivationPlanRoutes);


// Protected route example
app.get('/api/profile', protect, (req, res) => {
  res.json({ user: req.user });
});

// Basic route
app.get('/a', (req, res) => {
  res.json({ message: 'Smart Agriculture API is running!' });
});

module.exports=app;
