const fetch = require('node-fetch');

async function testApi() {
  try {
    console.log('测试连接到 API...');
    const response = await fetch('http://localhost:3000/health');
    
    if (response.ok) {
      const data = await response.text();
      console.log('API 连接成功！返回数据:', data);
    } else {
      console.error('API 连接失败，状态码:', response.status);
    }
  } catch (error) {
    console.error('测试 API 时出错:', error.message);
  }
}

testApi(); 