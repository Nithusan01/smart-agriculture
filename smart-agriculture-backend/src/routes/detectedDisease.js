const express = require('express')
const {addDetectedDisease,getAllDetectedDiseases,updateDetectedStatus,deleteDetectedDisease,getDetectionsByCultivationPlan} = require('../controllers/detectedDiseaseController')
const router =express.Router();
const {protect} = require('../middlewares/auth');
const { route } = require('./device');


router.post('/', protect,addDetectedDisease);
router.get('/', protect,getAllDetectedDiseases);
router.put('/:id',protect,updateDetectedStatus);
router.delete('/:id', protect,deleteDetectedDisease);
router.get('/plan/:cultivationPlanId',protect,getDetectionsByCultivationPlan);

module.exports = router;