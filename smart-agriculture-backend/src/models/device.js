const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Device = sequelize.define('device', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id'
    },
    deviceId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field:'device_id'
    },
    secretKey: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'secret_key',
    },
    deviceName: {
      type: DataTypes.STRING(100),
      field: 'device_name',
    },

    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'user_id' },
        field: 'user_id',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'inactive',
    },
    lastSeen: {
      type: DataTypes.DATE,
      field: 'last_seen',
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },

  }, {
    tableName: 'devices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // hooks: {
    //   beforeCreate: async (device) => {
    //     if (device.secretKey) {
    //       const saltRounds = 10;
    //       user.secretKey = await bcrypt.hash(device.secretKey, saltRounds);
    //     }
    //   },
    //   beforeUpdate: async (device) => {
    //     if (device.changed('secretKey')) {
    //       const saltRounds = 10;
    //       user.passwordHash = await bcrypt.hash(device.secretKey, saltRounds);
    //     }
    //   }
    // }
  });

//   Device.prototype.validateSecretKey = async function (key) {
//     return await bcrypt.compare(key, this.secretKey);
//   };

//   Device.prototype.toJSON = function () {
//     const values = Object.assign({}, this.get());
//     delete values.secretKey;
//     return values;
//   };

  return Device;
};