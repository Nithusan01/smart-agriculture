const express = require('express')
const {addDetectedDisease,getAllDetectedDiseases,updateDetectedStatus,deleteDetectedDisease} = require('../controllers/detectedDiseaseController')
const router =express.Router();
const {protect} = require('../middlewares/auth')


router.post('/', protect,addDetectedDisease);
router.get('/', protect,getAllDetectedDiseases);
router.put('/:id',protect,updateDetectedStatus);
router.delete('/:id', protect,deleteDetectedDisease);

module.exports = router;