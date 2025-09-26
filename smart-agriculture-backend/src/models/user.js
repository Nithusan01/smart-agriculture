const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'user_id'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'password_hash'
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name'
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      field: 'phone_number'
    },
    farmName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'farm_name'
    },

    farmLat: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true

    },
  
    farmLng: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true
    },
    farmTotalArea: {
      type: DataTypes.STRING(100),
      field: 'farm_total_area',
      allowNull:true
      
    },
    farmSoilType: {
      type: DataTypes.STRING(50),
      field: 'farm_soil_type'
    },
    role: {
      type: DataTypes.ENUM('admin', 'farmer'),
      defaultValue: 'farmer'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.passwordHash) {
          const saltRounds = 10;
          user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('passwordHash')) {
          const saltRounds = 10;
          user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
        }
      }
    }
  });

  // Association (User hasMany CultivationPlans)
  User.associate = (models) => {
    User.hasMany(models.CultivationPlan, {
      foreignKey: 'userId',
      as: 'plans',
      onDelete: 'CASCADE'
    });
  };


  User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
  };

  User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.passwordHash;
    return values;
  };

  return User;
};