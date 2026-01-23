const { DataTypes } = require('sequelize');
const device = require('./device');

module.exports = (sequelize) => {
  const CultivationPlan = sequelize.define(
    'CultivationPlan',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'plan_id',
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
        field: 'user_id',
      },

      cropId: {
        type: DataTypes.UUID,
        allowNull: true, // make optional if you still allow custom cropName
        references: { model: 'crops', key: 'crop_id' },
        field: 'crop_id',
      },
      deviceId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'devices', key: 'id' },
        field: 'device_id',
      },

      sectorName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'sector_name',
      },

      cropName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'crop_name',
      },

      area: {
        type: DataTypes.FLOAT,
        allowNull: false,
        field: 'area',
      },
      farmSoilType: {
        type: DataTypes.STRING(50),
        field: 'farm_soil_type',
      },
      farmLat: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
      },
      farmLng: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
      },
      plantingDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'planting_date',
      },
      expectedHarvestDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'expected_harvest_date',
      },
      status: {
        type: DataTypes.ENUM('planned', 'planted', 'harvested', 'cancelled'),
        defaultValue: 'planned',
        allowNull: false,
      },
    },
    {
      tableName: 'cultivation_plans',
      timestamps: true,
      underscored: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return CultivationPlan;
};
