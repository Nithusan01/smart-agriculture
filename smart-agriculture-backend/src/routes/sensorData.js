// src/routes/sensorRoutes.js
const express = require('express');
const {addSensorData,getLatest,getAggregated24h,getHistory} = require('../controllers/sensorDataController');
const {verifyDeviceToken} = require('../middlewares/authDevice');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Incoming data from device — protected by device JWT
router.post('/data',verifyDeviceToken, addSensorData);

// Public endpoints (or require user JWT as needed)
// Latest reading for a deviceId (public read or protect with user auth)
router.get('/:deviceId/latest',protect,getLatest);
router.get('/:deviceId/history',protect, getHistory);
router.get('/:deviceId/agg24h',protect, getAggregated24h);

module.exports = router;
