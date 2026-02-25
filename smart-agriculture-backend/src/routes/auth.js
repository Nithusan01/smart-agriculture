const express = require('express');
const { register, login, getMe, getAllUsers, deleteUser,updateUser,createUserByAdmin } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { registerValidation, loginValidation } = require('../middlewares/validation');
const { body } = require("express-validator");
const role = require("../middlewares/roleMiddleware")

const router = express.Router();

router.post('/register', registerValidation,register);
router.post('/login', loginValidation,login);
router.get('/me',protect, getMe);
router.get('/',protect,role(['admin']),getAllUsers);
router.delete('/:id',protect,role(['admin']),deleteUser)
router.put('/:id', protect,role(['admin']),updateUser)
router.post('/create-user', protect,role(['admin']), createUserByAdmin);



module.exports = router;