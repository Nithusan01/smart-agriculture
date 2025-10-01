const express = require('express')
const { createCultivationPlan,getPlans,updatePlan } = require('../controllers/cultivationPlanController');
const { protect } = require('../middlewares/auth');
const { body } = require("express-validator");


const router = express.Router();

router.post('/',protect,createCultivationPlan);
router.get('/',protect,getPlans);
router.put('/:id',protect,updatePlan)


module.exports = router;