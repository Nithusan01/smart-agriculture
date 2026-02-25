const express = require('express');
const { addSoilData, getAllSoilData } = require('../controllers/soilController');
const { protect } = require('../middlewares/auth');
const role = require("../middlewares/roleMiddleware");
const router = express.Router();

router.post('/', protect, role(['farmer']), addSoilData);
router.get('/', protect, role(['farmer']), getAllSoilData);

module.exports = router;