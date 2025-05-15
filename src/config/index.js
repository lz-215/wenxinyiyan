require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,
  qwen: {
    apiKey: process.env.QWEN_API_KEY,
    apiUrl: process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    model: 'qwen-plus'
  }
};

module.exports = config; 