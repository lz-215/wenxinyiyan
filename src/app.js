const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const config = require('./config');

// 初始化Express应用
const app = express();

// 中间件
app.use(cors()); // 启用CORS
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体

// 静态文件服务
app.use(express.static(path.join(__dirname, '..'))); // 服务根目录的静态文件

// API路由
app.use('/api', routes);

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API服务正常运行' });
});

// 所有其他GET请求返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 处理404错误 - 仅用于API路由
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 错误处理中间件
app.use(errorHandler);

// 导出app以便在server.js中使用
module.exports = app; 