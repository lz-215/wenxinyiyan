const axios = require('axios');
const config = require('../config');

/**
 * 调用通义千问API
 * @param {string} prompt - 用户输入的提示
 * @param {object} options - 可选参数，如温度、最大token数等
 * @returns {Promise<object>} - API响应
 */
async function callQwenApi(prompt, options = {}) {
  // 默认参数
  const defaultOptions = {
    temperature: 0.7,
    max_tokens: 1500,
    top_p: 0.9
  };
  
  // 合并默认参数和用户参数
  const params = { ...defaultOptions, ...options };
  
  try {
    // 构建请求体
    const requestBody = {
      model: config.qwen.model,
      input: {
        messages: [
          { role: 'user', content: prompt }
        ]
      },
      parameters: {
        temperature: params.temperature,
        max_tokens: params.max_tokens,
        top_p: params.top_p
      }
    };
    
    console.log('请求通义千问API，URL:', config.qwen.apiUrl);
    console.log('请求体:', JSON.stringify(requestBody, null, 2));
    
    // 发送请求到通义千问API
    const response = await axios.post(
      config.qwen.apiUrl,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.qwen.apiKey}`
        }
      }
    );
    
    console.log('API响应状态:', response.status);
    console.log('API响应数据:', JSON.stringify(response.data, null, 2));
    
    // 确保返回数据结构正确
    if (response.data && response.data.output) {
      // 已经具有正确的结构
      return response.data;
    } else if (response.data && response.data.choices && response.data.choices.length > 0) {
      // 可能是另一种API结构，转换为期望的格式
      return {
        output: {
          finish_reason: response.data.choices[0].finish_reason || "stop",
          text: response.data.choices[0].message.content
        }
      };
    } else {
      // 无法识别的结构，原样返回
      return response.data;
    }
  } catch (error) {
    // 捕获并处理错误
    console.error('调用通义千问API时出错:', error.message);
    if (error.response) {
      console.error('API错误详情:', error.response.data);
      return { error: error.response.data, status: error.response.status };
    }
    console.error('完整错误:', error);
    return { error: error.message };
  }
}

module.exports = { callQwenApi }; 