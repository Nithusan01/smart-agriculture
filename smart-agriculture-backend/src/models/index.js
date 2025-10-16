const { Sequelize, DataTypes } = require('sequelize'); 
const config = require('../config/config.js');
const UserModel = require('./User');
const CultivationPlanModel = require('./cultivationPlan');
const CropModel = require('./crop');

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

// Initialize models
const User = UserModel(sequelize, DataTypes);
const CultivationPlan = CultivationPlanModel(sequelize, DataTypes);
const Crop = CropModel(sequelize, DataTypes);

// Set up associations
User.hasMany(CultivationPlan, { foreignKey: 'userId', as: 'plans', onDelete: 'CASCADE' });
CultivationPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CultivationPlan.belongsTo(Crop, { foreignKey: 'cropId', as: 'crop' });
Crop.hasMany(CultivationPlan, { foreignKey: 'cropId', as: 'plans' });


const models = {
  User,
  CultivationPlan,
  Crop,
  sequelize,
  Sequelize
};

models.Op = Sequelize.Op;

module.exports = models;
