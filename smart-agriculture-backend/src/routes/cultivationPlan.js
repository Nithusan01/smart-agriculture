const express = require('express')
const { createCultivationPlan,getPlans,updatePlan,deletePlan,getPlanById, getPlanByDeviceId,removeDeviceFromPlan } = require('../controllers/cultivationPlanController');
const { protect } = require('../middlewares/auth');
const { body } = require("express-validator");
const role = require("../middlewares/roleMiddleware")



const router = express.Router();

router.post('/',protect,role(['farmer']),createCultivationPlan);
router.get('/',protect,role(['farmer','admin']),getPlans);
router.put('/:id',protect,role(['farmer']),updatePlan)
router.delete('/:id',protect,role(['farmer']),deletePlan)
router.get('/:id',protect,role(['farmer']),getPlanById);
router.get('/device/:deviceId',protect,role(['farmer']),getPlanByDeviceId)
router.patch('/device/:id',protect,role(['farmer']),removeDeviceFromPlan)

module.exports = router;