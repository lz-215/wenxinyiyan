const express = require('express');
const { chatCompletion } = require('../controllers/qwenController');

const router = express.Router();

// POST /api/qwen/chat - Chat endpoint for AI interaction
router.post('/chat', chatCompletion);

module.exports = router;