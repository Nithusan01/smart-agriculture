const express = require('express');
const { register, login, getMe, getAllUsers, deleteUser } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { registerValidation, loginValidation } = require('../middlewares/validation');
const { body } = require("express-validator");

const router = express.Router();

router.post('/register', registerValidation,register);
router.post('/login', loginValidation,login);
router.get('/me',protect, getMe);
router.get('/',protect,getAllUsers);
router.delete('/:id',protect,deleteUser)

module.exports = router;