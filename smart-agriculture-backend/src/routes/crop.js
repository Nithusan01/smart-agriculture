const express = require("express");
const { addCrop,getAllCrops,getCropById,getCropByName,updateCrop,deleteCrop} =require("../controllers/cropController")
const {protect} = require('../middlewares/auth')
const role = require("../middlewares/roleMiddleware")


const router = express.Router();

router.post('/',protect,role(['admin']),addCrop);
router.get('/',protect,role(['farmer','admin']),getAllCrops);
router.get('/:id',protect,role(['farmer','admin']),getCropById);
router.get('/:cropName',protect,role(['farmer','admin']),getCropByName);
router.put('/:id',protect,role(['admin']),updateCrop);
router.delete('/:id',protect,role(['admin']),deleteCrop);

module.exports = router;