const express = require('express');
const { deviceLogin,addDeviceToUser,removeDeviceFromUser,getUserDevices, registerDevice,getAllDevices,getCurrentDevice,deleteDevice,updateDevice, updateStatus} = require('../controllers/deviceAuthController');
const { verifyDeviceToken } = require('../middlewares/authDevice');
// const { registerValidation, loginValidation } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { body } = require("express-validator");
const role = require("../middlewares/roleMiddleware")

const router = express.Router();

router.post('/login',deviceLogin);
router.post('/add-to-user',protect,role(['farmer']),addDeviceToUser);
router.patch('/:deviceId/remove-from-user',protect,role(['farmer']),removeDeviceFromUser);
router.get('/user-devices',protect,role(['farmer','admin']),getUserDevices);
router.post('/register',protect,role(['admin']),registerDevice);
router.get('/me',verifyDeviceToken,role(['farmer']), getCurrentDevice);
router.get('/',protect,role(['admin']),getAllDevices);
router.delete('/:id',protect,role(['admin']),deleteDevice)
router.put('/:id',protect,role(['admin']),updateDevice);
router.patch('/:id/status',protect,role(['admin']),updateStatus);
// router.get('/plan/:planId',protect,getDeviceByPlanId);

module.exports = router;