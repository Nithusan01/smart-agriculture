const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { registerValidation, loginValidation,handleValidationErrors } = require('../middlewares/validation');
const { body } = require("express-validator");

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);

module.exports = router;