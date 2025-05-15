const express = require('express');
const { chatCompletion } = require('../controllers/qwenController');

const router = express.Router();

// POST /api/qwen/chat - 聊天接口
router.post('/chat', chatCompletion);

module.exports = router; 