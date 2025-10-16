const express = require('express')
const { createCultivationPlan,getPlans,updatePlan,deletePlan,getPlanById } = require('../controllers/cultivationPlanController');
const { protect } = require('../middlewares/auth');
const { body } = require("express-validator");


const router = express.Router();

router.post('/',protect,createCultivationPlan);
router.get('/',protect,getPlans);
router.put('/:id',protect,updatePlan)
router.delete('/:id',protect,deletePlan)
router.get('/:id',protect,getPlanById);

module.exports = router;