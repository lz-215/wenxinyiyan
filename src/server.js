const app = require('./app');
const config = require('./config');

// 启动服务器
const server = app.listen(config.port, () => {
  console.log(`服务器已启动，监听端口 ${config.port}`);
  console.log(`健康检查接口: http://localhost:${config.port}/health`);
  console.log(`通义千问聊天API: http://localhost:${config.port}/api/qwen/chat`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  // 不立即退出，记录错误
});

// 处理未捕获的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  // 不立即退出，记录错误
});

// 优雅关闭
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('收到关闭信号，正在优雅关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
  
  // 如果10秒内未关闭，则强制退出
  setTimeout(() => {
    console.error('关闭超时，强制退出');
    process.exit(1);
  }, 10000);
} 