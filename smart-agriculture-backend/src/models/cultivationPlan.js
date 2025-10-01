const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    const CultivationPlan = sequelize.define('CultivationPlan',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                field: 'plan_id'

            },

            // 👇 Add the foreign key field explicitly
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                foreignKey: true,
                references: {
                    model: 'users', // must match tableName in User model
                    key: 'user_id',
                },
                field: 'user_id',
            },

            sectorName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'sector_name',
                validate: {
                    len: [1],
                    notEmpty: true
                }

            },
            cropName: {

                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'crop_name'

            },

            area: {
                type: DataTypes.FLOAT,
                allowNull: false,
                field: 'area'
            },
            farmSoilType: {
                type: DataTypes.STRING(50),
                field: 'farm_soil_type'
            },
            farmLat: {
                type: DataTypes.DECIMAL(10, 6),
                allowNull: false
            },
            farmLng: {
                type: DataTypes.DECIMAL(10, 6),
                allowNull: false
            },

            plantingDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                field: 'planting_date'
            },

            expectedHarvestDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'expected_harvest_date'
            },

            status: {
                type: DataTypes.ENUM,
                allowNull: false,
                values: ['planned', 'planted', 'harvested', 'cancelled'],
                defaultValue: 'planned',
                field: 'status'
            },

        },
        {
            tableName: 'cultivation_plans',
            timestamps: true,
            underscored: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        });

    // Association (Plan belongsTo User)
    CultivationPlan.associate = (models) => {
        CultivationPlan.belongsTo(models.User, {
            foreignKey: {
                name: 'userId',
                allowNull: false,
                field: 'user_id'
            },
            as: 'user',
            onDelete: 'CASCADE'
        });
    };
    return CultivationPlan;

};

