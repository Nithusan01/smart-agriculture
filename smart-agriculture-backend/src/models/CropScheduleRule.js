const crop = require("./crop");

module.exports = (Sequelize,DataTypes) => {
    const CropScheduleRule = Sequelize.define("CropScheduleRule",{

        id: { type:DataTypes.UUID,
             defaultValue:DataTypes.UUIDV4 ,
              primaryKey:true,
               field:'id'
            },

        stageName: {
            type:DataTypes.STRING(100),
            allowNull:false,
            field:'stage_name'
        },
        startDay: {
            type:DataTypes.INTEGER,
            allowNull:false,
            field:'start_day'
        },
        endDay:{
            type:DataTypes.INTEGER,
            allowNull:false,
            field:'end_day'
        },
        fertilizer:{
            type:DataTypes.STRING(255),
            allowNull:true,
            field:'fertilizer'
        },
        irrigation:{
            type:DataTypes.STRING(255),
            allowNull:true,
            field:'irrigation'
        },

        cropId:{
            type:DataTypes.UUID,
            allowNull:false,
            references:{model:'crops',key:'crop_id'},
            field:'crop_id'
        }
    },{
        tableName:'crop_schedule_rules',
        timestamps:false,
    }); 
    return CropScheduleRule;
}