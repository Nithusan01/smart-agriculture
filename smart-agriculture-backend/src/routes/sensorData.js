// src/routes/sensorRoutes.js
const express = require('express');
const {addSensorData,getLatest,getAggregated24h,getHistory} = require('../controllers/sensorDataController');
const {verifyDeviceToken} = require('../middlewares/authDevice');
const { protect } = require('../middlewares/auth');
const role = require("../middlewares/roleMiddleware")


const router = express.Router();

// Incoming data from device — protected by device JWT
router.post('/data',verifyDeviceToken, addSensorData);

// Public endpoints (or require user JWT as needed)
// Latest reading for a deviceId (public read or protect with user auth)
router.get('/:deviceId/latest',protect,role(['farmer']),getLatest);
router.get('/:deviceId/history',protect, role(['farmer']),getHistory);
router.get('/:deviceId/agg24h',protect, role(['farmer']),getAggregated24h);

module.exports = router;
