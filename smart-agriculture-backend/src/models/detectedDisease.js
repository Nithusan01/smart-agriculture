const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DetectedDisease = sequelize.define('DetectedDisease', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'detected_id',
    },

    cultivationPlanId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'cultivation_plans',
        key: 'plan_id',
      },
      field: 'cultivation_plan_id',
    },

    diseaseId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'diseases',
        key: 'disease_id',
      },
      field: 'disease_id',
    },

    // userId: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    //   references: {
    //     model: 'users',
    //     key: 'user_id',
    //   },
    //   field: 'user_id',
    // },

    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'image_url',
    },

    detectedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'detected_date',
    },

    confidence: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM('active', 'resolved',"detected"),
      defaultValue: 'detected',
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'detected_diseases',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return DetectedDisease;
};
