const express = require('express')
const { createCultivationPlan } = require('../controllers/cultivationPlanController');
const { protect } = require('../middlewares/auth');
const { body } = require("express-validator");


const router = express.Router();

router.post('/plan',protect,createCultivationPlan);

module.exports = router;