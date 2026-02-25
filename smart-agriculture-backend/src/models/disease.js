const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Disease = sequelize.define('Disease', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'disease_id'
    },

    diseaseName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'disease_name'
    },
    cause: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    symptoms: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    treatment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    severity: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      defaultValue: 'Medium'
    },
    prevention: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'image_url'
    },
    spreadRate: {
      type: DataTypes.ENUM('Slow', 'Moderate', 'rapid'),
      defaultValue: 'Moderate',
      field: 'spread_rate'
    },
    cropId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'crops',
        key: 'crop_id'
      }
    }

  }, {
    tableName: 'diseases',
    timestamps: true,
    underscored: true,
  });

  return Disease;
};
