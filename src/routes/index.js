const express = require('express');
const qwenRoutes = require('./qwenRoutes');

const router = express.Router();

// API接口前缀
router.use('/qwen', qwenRoutes);

// 健康检查接口
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API服务正常运行' });
});

module.exports = router; 