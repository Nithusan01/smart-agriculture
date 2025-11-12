// models/Crop.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Crop = sequelize.define('Crop', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'crop_id',
    },
    cropName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field:'crop_name'
    },
    cropType: {
      type: DataTypes.ENUM('Seasonal', 'Perennial'),
      allowNull: false,
      field:'crop_type'
    },
    durationDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field:'duration_days',
    },
    waterRequirement: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      allowNull: false,
      field:'water_requirement'
    },
    season: {
      type: DataTypes.ENUM('Yala', 'Maha', 'Both'),
      allowNull: false,
      field:'season',
    },
    recommendedSoil: {
      type: DataTypes.ENUM('Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty', 'Chalky'),
      allowNull: true,
      field:'recommended_soil',
    },
  }, {
    tableName: 'crops',
    timestamps: false,
  });

  return Crop;
};
