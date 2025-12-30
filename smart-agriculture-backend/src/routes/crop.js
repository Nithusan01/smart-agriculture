const express = require("express");
const { addCrop,getAllCrops,getCropById,getCropByName,updateCrop,deleteCrop} =require("../controllers/cropController")
const {protect} = require('../middlewares/auth')

const router = express.Router();

router.post('/',protect,addCrop);
router.get('/',protect,getAllCrops);
router.get('/:id',protect,getCropById);
router.get('/:cropName',protect,getCropByName);
router.put('/:id',protect,updateCrop);
router.delete('/:id',protect,deleteCrop);

module.exports = router;