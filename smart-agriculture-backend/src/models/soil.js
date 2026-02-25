const{DataTypes} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Soil = sequelize.define('Soil', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'soil_id'
    },
    soilType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'soil_type'
    },
    phLevel: {  
        type: DataTypes.FLOAT,
        allowNull: false,
        field: 'ph_level'
    },
    nutrientContent: {
        type: DataTypes.TEXT,
        allowNull: true,

    },
    moistureLevel: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'moisture_level'
    },
    
  }, {
    tableName: 'soils',
    timestamps: true,
    underscored: true,
  });
  return Soil;
}