const { SensorData, Device } = require('../models');
const { emitSensorUpdate } = require('../socket');
const { Op } = require('sequelize');

const addSensorData = async (req, res) => {
  try {
    // Accept both deviceId from token and body
    const payloadDeviceId = req.device?.deviceId;
    const { deviceId: bodyDeviceId, temperature, humidity, readingTime } = req.body;
    const deviceId = bodyDeviceId || payloadDeviceId;

    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId required' 
      });
    }

    // Ensure device exists (deviceId is the string identifier)
    const device = await Device.findOne({ where: { deviceId } });
    if (!device) {
      return res.status(404).json({ 
        success: false, 
        message: 'Device not registered' 
      });
    }

    // Create sensor record
    const newSensor = await SensorData.create({
      deviceId: device.id, // Use the internal UUID from Device.id
      temperature,
      humidity,
      readingTime: readingTime || new Date(),
      userId: device.userId
    });

    // Update device last seen
    await device.update({ 
      lastSeen: new Date(), 
      status: 'active' 
    });

    // Prepare payload for WebSocket with all needed data
    const sensorPayload = {
      ...newSensor.toJSON(),
      // Add the string deviceId for frontend reference
      publicDeviceId: device.deviceId,
      deviceName: device.name || device.deviceId
    };

    // Emit to realtime subscribers using the string deviceId
    emitSensorUpdate(device.deviceId, sensorPayload);

    return res.status(200).json({ 
      success: true, 
      data: newSensor 
    });
  } catch (err) {
    console.error('addSensorData error:', err);
    return res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

const getLatest = async (req, res) => {
  try {
    const { deviceId } = req.params; // This is the string deviceId
    
    // Find device by string deviceId
    const device = await Device.findOne({ where: { deviceId } });
    if (!device) {
      return res.status(404).json({ 
        success: false, 
        message: 'Device not found' 
      });
    }

    const latest = await SensorData.findOne({
      where: { deviceId: device.id }, // Use UUID here
      order: [['createdAt', 'DESC']]
    });

    // Add public deviceId to response for clarity
    const responseData = latest ? {
      ...latest.toJSON(),
      publicDeviceId: device.deviceId
    } : null;

    res.json({ 
      success: true, 
      data: responseData 
    });
  } catch (err) {
    console.error('getLatest error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};
const getHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { from, to, limit = 100 } = req.query;
    
    // Look up device
    const device = await Device.findOne({ where: { deviceId } });
    if (!device) {
      return res.status(404).json({ 
        success: false, 
        message: 'Device not found' 
      });
    }

    // Build WHERE clause
    const where = { deviceId: device.id }; // Use internal UUID
    
    // Handle date range filters
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    // Get sensor data - CHANGED ORDER TO DESC for recent first
    const data = await SensorData.findAll({
      where,
      order: [['createdAt', 'DESC']], // Changed from ASC to DESC
      limit: Math.min(parseInt(limit, 10), 1000)
    });

    // Enhance data with public deviceId
    const enhancedData = data.map(record => ({
      ...record.toJSON(),
      publicDeviceId: device.deviceId
    }));

    res.json({ 
      success: true, 
      data: enhancedData 
    });
  } catch (err) {
    console.error('getHistory error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

const getAggregated24h = async (req, res) => {
  try {
    const { deviceId } = req.params; // String deviceId
    const device = await Device.findOne({ where: { deviceId } });
    if (!device) {
      return res.status(404).json({ 
        success: false, 
        message: 'Device not found' 
      });
    }

    // Postgres date_trunc aggregation
    const sequelize = require('../models').sequelize;
    const rows = await sequelize.query(
      `SELECT 
        date_trunc('hour', "created_at") as hour,
        AVG(temperature) as avg_temp,
        AVG(humidity) as avg_humidity,
        MIN(temperature) as min_temp,
        MAX(temperature) as max_temp,
        MIN(humidity) as min_humidity,
        MAX(humidity) as max_humidity,
        COUNT(*) as reading_count
       FROM sensor_data
       WHERE device_id = :deviceId 
         AND created_at > NOW() - INTERVAL '24 hours'
       GROUP BY hour
       ORDER BY hour DESC`,
      { 
        replacements: { deviceId: device.id }, // Use UUID
        type: sequelize.QueryTypes.SELECT 
      }
    );

    res.json({ 
      success: true, 
      data: rows,
      deviceInfo: {
        deviceId: device.deviceId,
        deviceName: device.name
      }
    });
  } catch (err) {
    console.error('getAggregated24h error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Additional helpful endpoint
const getDeviceStats = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const device = await Device.findOne({ where: { deviceId } });
    if (!device) {
      return res.status(404).json({ 
        success: false, 
        message: 'Device not found' 
      });
    }

    // Get latest reading
    const latest = await SensorData.findOne({
      where: { deviceId: device.id },
      order: [['createdAt', 'DESC']]
    });

    // Get 24-hour stats
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dayStats = await SensorData.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('temperature')), 'avg_temp'],
        [sequelize.fn('AVG', sequelize.col('humidity')), 'avg_humidity'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_readings']
      ],
      where: {
        deviceId: device.id,
        createdAt: { [Op.gte]: twentyFourHoursAgo }
      }
    });

    res.json({
      success: true,
      data: {
        deviceInfo: {
          deviceId: device.deviceId,
          name: device.name,
          status: device.status,
          lastSeen: device.lastSeen
        },
        latestReading: latest,
        dayStats: dayStats
      }
    });
  } catch (err) {
    console.error('getDeviceStats error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

module.exports = {
  addSensorData,
  getLatest,
  getHistory,
  getAggregated24h,
  getDeviceStats
};