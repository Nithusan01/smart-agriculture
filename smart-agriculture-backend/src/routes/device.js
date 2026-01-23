const express = require('express');
const { deviceLogin,addDeviceToUser,removeDeviceFromUser,getUserDevices, registerDevice,getAllDevices,getCurrentDevice,deleteDevice,updateDevice, updateStatus} = require('../controllers/deviceAuthController');
const { verifyDeviceToken } = require('../middlewares/authDevice');
// const { registerValidation, loginValidation } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { body } = require("express-validator");

const router = express.Router();

router.post('/login',deviceLogin);
router.post('/add-to-user',protect,addDeviceToUser);
router.patch('/:deviceId/remove-from-user',protect,removeDeviceFromUser);
router.get('/user-devices',protect,getUserDevices);
router.post('/register',protect,registerDevice);
router.get('/me',verifyDeviceToken, getCurrentDevice);
router.get('/',protect,getAllDevices);
router.delete('/:id',protect,deleteDevice)
router.put('/:id',protect,updateDevice);
router.patch('/:id/status',protect,updateStatus);
// router.get('/plan/:planId',protect,getDeviceByPlanId);

module.exports = router;