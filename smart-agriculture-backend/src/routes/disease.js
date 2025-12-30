const express = require('express')
const {createDisease,getAllDiseases,getDiseaseById,updateDisease,deleteDisease,getDiseasesByCropName} = require('../controllers/diseaseController')
const {protect} = require('../middlewares/auth')

const router = express.Router()

router.post('/', protect,createDisease);
router.get('/', protect,getAllDiseases);
router.get('/:id', protect,getDiseaseById);
router.put('/:id',protect,updateDisease);
router.delete('/:id', protect,deleteDisease);
router.get('/:cropName', protect, getDiseasesByCropName);

module.exports = router;