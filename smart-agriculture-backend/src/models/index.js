const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config.js');

// Import models
const UserModel = require('./user');
const CropModel = require('./crop');
const CultivationPlanModel = require('./cultivationPlan');
const DiseaseModel = require('./disease');
const DetectedDiseaseModel = require('./DetectedDisease');
const ChatHistoryModel = require('./chatHistory.js');
const DeviceModel = require('./device.js');
const SensorDataModel = require('./sensorData');
const CropScheduleRuleModel = require("./CropScheduleRule");

// Determine environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions || {},
  }
);

// Initialize all models
const User = UserModel(sequelize, DataTypes);
const Crop = CropModel(sequelize, DataTypes);
const CultivationPlan = CultivationPlanModel(sequelize, DataTypes);
const Disease = DiseaseModel(sequelize, DataTypes);
const DetectedDisease = DetectedDiseaseModel(sequelize, DataTypes);
const ChatHistory = ChatHistoryModel(sequelize,DataTypes);
const Device = DeviceModel(sequelize,DataTypes);
const SensorData = SensorDataModel(sequelize,DataTypes)
const CropScheduleRule = CropScheduleRuleModel(sequelize,DataTypes);
//
// ✅ Define Associations
//

// 1️⃣ User → CultivationPlan (One-to-Many)
User.hasMany(CultivationPlan, {
  foreignKey: 'userId',
  as: 'plans',
  onDelete: 'CASCADE',
});
CultivationPlan.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// 2️⃣ Crop → CultivationPlan (One-to-Many)
Crop.hasMany(CultivationPlan, {
  foreignKey: 'cropId',
  as: 'plans',
});
CultivationPlan.belongsTo(Crop, {
  foreignKey: 'cropId',
  as: 'crop',
});

// 3️⃣ Crop → Disease (One-to-Many)
Crop.hasMany(Disease, {
  foreignKey: 'cropId',
  as: 'diseases',
});
Disease.belongsTo(Crop, {
  foreignKey: 'cropId',
  as: 'crop',
});

// 4️⃣ CultivationPlan → DetectedDisease (One-to-Many)
CultivationPlan.hasMany(DetectedDisease, {
  foreignKey: 'cultivationPlanId',
  as: 'detectedDiseases',
});
DetectedDisease.belongsTo(CultivationPlan, {
  foreignKey: 'cultivationPlanId',
  as: 'plan',
});

// 5️⃣ Disease → DetectedDisease (One-to-Many)
Disease.hasMany(DetectedDisease, {
  foreignKey: 'diseaseId',
  as: 'detectedInPlans',
});
DetectedDisease.belongsTo(Disease, {
  foreignKey: 'diseaseId',
  as: 'disease',
});

// 6️⃣ User → DetectedDisease (One-to-Many)
User.hasMany(DetectedDisease, {
  foreignKey: 'userId',
  as: 'userDetectedDiseases',
});
DetectedDisease.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(SensorData, {
  foreignKey: 'userId',
  as: 'sensorData',
  onDelete: 'CASCADE',
});
SensorData.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Device, {
  foreignKey: 'userId',
  as: 'device',
  onDelete: 'CASCADE',
});
Device.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Device.hasMany(SensorData, {
  foreignKey: 'deviceId',
  as: 'sensorData'
});

SensorData.belongsTo(Device, {
  foreignKey: 'deviceId',
  as: 'device'
});
Crop.hasMany(CropScheduleRule, {
  foreignKey: "cropId"
});

CropScheduleRule.belongsTo(Crop, {
  foreignKey: "cropId"
});

Device.belongsTo(CultivationPlan, {
  foreignKey: 'cultivationPlanId',
  as: 'cultivationPlan',
  onDelete: 'SET NULL'
});

CultivationPlan.hasOne(Device, {
  foreignKey: 'cultivationPlanId',
  as: 'device',
  onDelete: 'SET NULL'
});

//
// ✅ Export all models
//
const models = {
  User,
  Crop,
  CultivationPlan,
  Disease,
  DetectedDisease,
  ChatHistory,
  Device,
  SensorData,
  CropScheduleRule,
  sequelize,
  Sequelize,
};

// Add Sequelize operators
models.Op = Sequelize.Op;

module.exports = models;
