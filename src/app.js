const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const config = require('./config');

// 初始化Express应用
const app = express();

// 中间件
app.use(cors()); // 启用CORS
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体

// 路由
app.use(routes);

// 处理404错误
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 错误处理中间件
app.use(errorHandler);

// 导出app以便在server.js中使用
module.exports = app; 