const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models/index');
require('dotenv').config();
const {protect} = require('./middlewares/auth')

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// define 
const authRoutes = require('./routes/auth');
const cultivationPlanRoutes = require('./routes/cultivationPlan')


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

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
const db = require('./models');

 db.sequelize.sync({ alter: true ,force:true }) // creates the table if it doesn't exist
  .then(() => console.log('Database & tables synced'))
  .catch(err => console.error('Sync error:', err));

// Start server
app.listen(PORT, async () => {
  await testConnection();
  console.log(`Server is running on port ${PORT}`);
});