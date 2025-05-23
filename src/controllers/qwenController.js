const { callQwenApi } = require('../utils/qwenService');

/**
 * 处理聊天请求
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
async function chatCompletion(req, res) {
  try {
    const { prompt, options } = req.body;
    
    // 验证请求数据
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        message: '请提供有效的prompt参数'
      });
    }
    
    // 调用通义千问API
    const response = await callQwenApi(prompt, options || {});
    
    // 检查是否有错误
    if (response.error) {
      return res.status(response.status || 500).json({
        success: false,
        message: '调用AI模型失败',
        error: response.error
      });
    }
    
    // 返回成功结果，直接传递output部分
    return res.status(200).json({
      success: true,
      data: response.output
    });
  } catch (error) {
    console.error('处理聊天请求时出错:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
}

module.exports = {
  chatCompletion
}; 