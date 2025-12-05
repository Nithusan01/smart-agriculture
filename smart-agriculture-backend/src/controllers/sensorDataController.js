const {SensorData} = require('../models');
const { emitSensorUpdate } = require('../socket');
const { Op } = require('sequelize');

exports.getSensorDataByDevice = async (req,res) => {
    try {
        const {deviceId} = req.params;
        const sensorData = await SensorData.findAll({where:{deviceId}});
        res.status(200).json({success:true, data:sensorData});
        
    } catch (error) {
        
        console.error('Error fetching sensor data by device:', error);
        res.status(500).json({success:false, message:'Server error during fetching sensor data by device' });
    }
}
exports.addSensorData = async (req,res) => {
    try {
        const {deviceId, temperature , humidity,soilMoisture} = req.body;
        const newSensorData = await SensorData.create({
            deviceId,
            temperature,    
            humidity,
            soilMoisture
        });
        res.status(201).json({success:true, data:newSensorData});
        
    } catch (error) {
        
    }
}