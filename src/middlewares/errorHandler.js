/**
 * 错误处理中间件
 */
function errorHandler(err, req, res, next) {
  console.error('服务器错误:', err.stack);
  
  // 设置默认状态码和错误消息
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';
  
  // 返回错误响应
  res.status(statusCode).json({
    success: false,
    message: message,
    // 开发环境下返回详细错误堆栈，生产环境下不返回
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler; 