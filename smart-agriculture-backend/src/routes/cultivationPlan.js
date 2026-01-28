const express = require('express')
const { createCultivationPlan,getPlans,updatePlan,deletePlan,getPlanById, getPlanByDeviceId,removeDeviceFromPlan } = require('../controllers/cultivationPlanController');
const { protect } = require('../middlewares/auth');
const { body } = require("express-validator");


const router = express.Router();

router.post('/',protect,createCultivationPlan);
router.get('/',protect,getPlans);
router.put('/:id',protect,updatePlan)
router.delete('/:id',protect,deletePlan)
router.get('/:id',protect,getPlanById);
router.get('/device/:deviceId',protect,getPlanByDeviceId)
router.patch('/device/:id',protect,removeDeviceFromPlan)

module.exports = router;