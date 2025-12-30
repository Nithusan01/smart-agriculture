// controllers/deviceAuth.controller.js
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Device, User } = require("../models"); // Import User model if needed
const user = require("../models/user");

// -------------- GENERATORS -----------------

const generateDeviceId = () =>
  "ESP32_" + crypto.randomBytes(4).toString("hex").toUpperCase();

const generateSecretKey = () =>
  crypto.randomBytes(4).toString("hex"); // strong key

// -------------- DEVICE LOGIN -----------------

exports.deviceLogin = async (req, res) => {
  try {
    const { deviceId, secretKey } = req.body;

    console.log('🔐 Device Login Attempt:', { deviceId });

    if (!deviceId || !secretKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId and secretKey are required' 
      });
    }

    const device = await Device.findOne({ 
      where: { 
        deviceId: deviceId.trim() 
      } 
    });

    if (!device) {
      console.log('❌ Device not found:', deviceId);
      return res.status(404).json({ 
        success: false, 
        message: 'Device not found' 
      });
    }

    console.log('🔍 Found device:', device.deviceName);
    console.log('📝 Device userId:', device.userId);

    if (device.secretKey !== secretKey) {
      console.log('❌ Secret key mismatch');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if device is linked to a user
    const isLinkedToUser = !!device.userId;
    
    if (!isLinkedToUser) {
      console.log('⚠️ Device not linked to any user:', deviceId);
      // We still authenticate but warn ESP32
    }

    // Update last seen
    device.lastSeen = new Date();
    await device.save();

    // Generate JWT token (include userId if exists)
    const tokenPayload = {
      id:device.id,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      userId: device.userId || null,
      type: 'device'
    };
    
    // Add userId to token if device is linked to user
    if (device.userId) {
      tokenPayload.userId = device.userId;
    }
    
    const token = jwt.sign(
      tokenPayload,
      process.env.DEVICE_JWT_SECRET || 'your-device-secret-key-123',
      { expiresIn: '30d' }
    );

    console.log('✅ Token generated for device:', device.deviceId);

    return res.json({
      success: true,
      message: isLinkedToUser 
        ? 'Device authenticated successfully' 
        : 'Device authenticated but not linked to user',
      token: token,
      userId: device.userId, // Send userId (null if not linked)
      isLinkedToUser: isLinkedToUser, // Explicit flag for ESP32
      device: {
        id: device.id,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        userId: device.userId, // Include in device object
        location: device.location,
        status: device.status,
        lastSeen: device.lastSeen
      }
    });

  } catch (err) {
    console.error('🔥 Device login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

// ---------ADD DEVICE TO USER-----------
exports.addDeviceToUser = async (req, res) => {
  try {
    const { deviceId, secretKey } = req.body; 
    
    if (!deviceId || !secretKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId and secretKey are required' 
      });
    }

    const device = await Device.findOne({ where: { deviceId } });
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }
    
    if (device.secretKey !== secretKey) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const userId = req.user.id; // From JWT middleware

    // Check if device already linked to another user
    if (device.userId && device.userId !== userId) {
      return res.status(409).json({
        success: false,
        message: 'Device already linked to another user'
      });
    }
    if (device.userId && device.userId === userId) {
      return res.status(409).json({
        success: false,
        message: 'Device already linked to your account'
      });
    }


    device.userId = userId;
    device.status = "active";
    await device.save();
    
    return res.json({ 
      success: true, 
      message: 'Device added to user successfully', 
      device: {
        id: device.id,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        userId: device.userId,
        location: device.location,
        status: device.status
      }
    });

  } catch (err) {
    console.error('❌ Add device to user error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

// ---------------REMOVE DEVICE FROM USER----------------
exports.removeDeviceFromUser = async (req, res) => {
  try {
    const { deviceId } = req.params; // Changed from req.body to req.params
    
    if (!deviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'deviceId is required' 
      });
    }

    const userId = req.user.id; // From JWT middleware
    const device = await Device.findOne({ 
      where: { 
        deviceId,  
        userId // Ensure user owns the device
      } 
    });
    
    if (!device) {
      return res.status(404).json({ 
        success: false, 
        message: 'Device not found or not owned by user' 
      });
    }
    
    device.userId = null;
    await device.save();

    
    return res.json({ 
      success: true, 
      message: 'Device removed from user successfully',
      device: {
        id: device.id,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        userId: device.userId
      }
    });

  } catch (err) {
    console.error('❌ Remove device from user error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

// ---------------FETCH DEVICES OF A USER----------------
exports.getUserDevices = async (req, res) => {
  try {
    const userId = req.user.id;
    const devices = await Device.findAll({ 
      where: { userId },
      order: [['lastSeen', 'DESC']]
    });
    
    // Get sensor data count for each device (optional)
    const devicesWithStats = await Promise.all(
      devices.map(async (device) => {
        // If you have SensorData model
        // const dataCount = await SensorData.count({ where: { deviceId: device.id } });
        return {
          ...device.toJSON(),
          // dataCount: dataCount || 0
        };
      })
    );
    
    return res.json({ 
      success: true, 
      devices: devicesWithStats 
    });
  } catch (err) {
    console.error('❌ Fetch user devices error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

// -------------- REGISTER DEVICE (ADMIN ONLY) -----------------

exports.registerDevice = async (req, res) => {
  try {
    const { deviceName, location } = req.body;

    if (!deviceName) {
      return res.status(400).json({
        success: false,
        message: 'deviceName is required'
      });
    }

    const deviceId = generateDeviceId();
    const secretKey = generateSecretKey();

    const device = await Device.create({
      deviceId,
      secretKey,
      deviceName: deviceName.trim(),
      location: location || 'Not specified',
      status: "inactive", // Starts as inactive until linked to user
      userId: null // Not linked to any user initially
    });

    console.log('✅ Device registered:', deviceId);

    return res.json({
      success: true,
      message: "Device registered successfully",
      device: {
        id: device.id,
        deviceId: device.deviceId,
        secretKey: device.secretKey, // Return secret key ONLY ONCE
        deviceName: device.deviceName,
        location: device.location,
        status: device.status
      },
      warning: "Save the secret key now - it won't be shown again!"
    });

  } catch (err) {
    console.error("❌ Register device error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// -------------- GET ALL DEVICES (ADMIN) -----------------

exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.findAll({
      include: [
        {
          model: User, // If you have User model
          as:'user',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.json({ 
      success: true, 
      count: devices.length,
      data:devices 
    });
  } catch (err) {
    console.error('❌ Get all devices error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// -------------- GET DEVICE BY ID -----------------

exports.getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const device = await Device.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });
    
    if (!device) {
      return res.status(404).json({ 
        success: false, 
        message: "Device not found" 
      });
    }

    return res.json({ 
      success: true, 
      device 
    });
  } catch (err) {
    console.error('❌ Get device by ID error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// -------------- GET CURRENT DEVICE (DEVICE JWT) -----------------

exports.getCurrentDevice = async (req, res) => {
  try {
    const device = await Device.findAll({ 
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });
    
    if (!device) {
      return res.status(404).json({ 
        success: false,
        message: "Device not found" 
      });
    }

    return res.json({ 
      success: true, 
      device 
    });
  } catch (err) {
    console.error('❌ Get current device error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// -------------- DELETE DEVICE -----------------

exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const device = await Device.findByPk(id);
    if (!device) {
      return res.status(404).json({ 
        success: false,
        message: "Device not found" 
      });
    }

    await device.destroy();
    
    return res.json({ 
      success: true,
      message: "Device deleted successfully" 
    });
  } catch (err) {
    console.error('❌ Delete device error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// -------------- UPDATE DEVICE INFO -----------------

exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const device = await Device.findByPk(id);
    if (!device) {
      return res.status(404).json({ 
        success: false,
        message: "Device not found" 
      });
    }

    // Don't allow updating deviceId or secretKey
    const { deviceId, secretKey, ...updateData } = req.body;
    
    await device.update(updateData);
    
    return res.json({ 
      success: true,
      message: "Device updated successfully",
      device 
    });
  } catch (err) {
    console.error('❌ Update device error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// -------------- UPDATE DEVICE STATUS -----------------

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive', 'maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, inactive, maintenance)'
      });
    }

    const device = await Device.findByPk(id);
    if (!device) {
      return res.status(404).json({ 
        success: false,
        message: "Device not found" 
      });
    }

    await device.update({ status });
    
    return res.json({ 
      success: true,
      message: `Device status updated to ${status}`,
      device 
    });
  } catch (err) {
    console.error('❌ Update device status error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};