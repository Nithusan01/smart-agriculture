const { Sequelize, DataTypes } = require('sequelize'); // Add DataTypes here
const config = require('../config/config.js');
const UserModel = require('./User'); // Make sure this is lowercase 'user'

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];


const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions || {}
  }
);

// Pass both sequelize AND DataTypes to your User model
const User = UserModel(sequelize, DataTypes);

const models = {
  User,
  sequelize,
  Sequelize
};

// Also export Op for easy access
models.Op = Sequelize.Op;

module.exports = models;