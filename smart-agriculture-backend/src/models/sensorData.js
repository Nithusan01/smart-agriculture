const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
const SensorData = sequelize.define("sensorData", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    
  },
  deviceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'devices',
        key: 'id',
        field: 'device_id'
      }
    },
 
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  humidity: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  readingTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "sensor_data",
  underscored: true,
  timestamps: true,
  updatedAt: false,
});

return SensorData;
};

