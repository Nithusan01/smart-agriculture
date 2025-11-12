const express = require('express');
const router = express.Router();
const { chat, getDiseaseInfo, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middlewares/auth');

router.post('/chat', protect, chat);
router.get('/disease/:diseaseName', getDiseaseInfo);
router.get('/history', protect, getChatHistory);

module.exports = router;