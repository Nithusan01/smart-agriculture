const express = require('express');
const { register, login, getMe, getAllUsers, deleteUser,updateUser,createUserByAdmin } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { registerValidation, loginValidation } = require('../middlewares/validation');
const { body } = require("express-validator");

const router = express.Router();

router.post('/register', registerValidation,register);
router.post('/login', loginValidation,login);
router.get('/me',protect, getMe);
router.get('/',protect,getAllUsers);
router.delete('/:id',protect,deleteUser)
router.put('/:id', protect,updateUser)
router.post('/create-user', protect, createUserByAdmin);



module.exports = router;