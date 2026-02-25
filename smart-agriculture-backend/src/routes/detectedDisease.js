const express = require('express')
const {addDetectedDisease,getAllDetectedDiseases,deleteDetectedDisease,getDetectionsByCultivationPlan,updateDetectedDiseaseStatus} = require('../controllers/detectedDiseaseController')
const router =express.Router();
const {protect} = require('../middlewares/auth');
const { route } = require('./device');
const role = require("../middlewares/roleMiddleware")



router.post('/', protect,role(['farmer']),addDetectedDisease);
router.get('/', protect,role(['farmer']),getAllDetectedDiseases);
router.put('/:id/status',protect,role(['farmer']),updateDetectedDiseaseStatus);
router.delete('/:id', protect,role(['farmer']),deleteDetectedDisease);
router.get('/plan/:cultivationPlanId',protect,role(['farmer']),getDetectionsByCultivationPlan);

module.exports = router;