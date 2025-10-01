const db = require('../models');  // This imports index.js from models folder
const { sequelize } = db;

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true}); 
    console.log('✅ Database & tables synced');
  } catch (err) {
    console.error('❌ Sync error:', err);
  }
};

module.exports = { testConnection, syncDatabase };