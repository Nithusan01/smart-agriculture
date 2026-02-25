const express = require('express')
const {createDisease,getAllDiseases,getDiseaseById,updateDisease,deleteDisease,getDiseasesByCropName} = require('../controllers/diseaseController')
const {protect} = require('../middlewares/auth')
const role = require("../middlewares/roleMiddleware")


const router = express.Router()

router.post('/', protect,role(['admin']),createDisease);
router.get('/', protect,role(['admin','farmer']),getAllDiseases);
router.get('/:id', protect,role(['admin','farmer']),getDiseaseById);
router.put('/:id',protect,role(['admin']),updateDisease);
router.delete('/:id', protect,role(['admin']),deleteDisease);
router.get('/:cropName', protect,role(['admin','farmer']), getDiseasesByCropName);

module.exports = router;