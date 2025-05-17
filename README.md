# GPT4.1 API服务

这是一个基于Node.js和Express的后端服务，用于调用GPT4.1大语言模型API，提供简单易用的接口给前端或其他服务使用。

## 功能特点

- 简单的RESTful API接口
- 完整的错误处理和日志记录
- CORS支持，可以从浏览器直接调用
- 环境变量配置
- 优雅关闭处理

## 快速开始

### 前提条件

- Node.js 14.x 或更高版本
- GPT4.1 API密钥

### 安装步骤

1. 克隆项目

```bash
git clone <仓库地址>
cd wenxinyiyan
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

创建`.env`文件并填入以下内容：

```
GPT_API_KEY=your_api_key_here
GPT_API_URL=your_api_url_here
PORT=3000
```

请将`your_api_key_here`和`your_api_url_here`替换为您的实际API密钥和URL。

4. 启动服务

```bash
npm start
```

开发模式启动(支持热重载)：

```bash
npm run dev
```

## API使用说明

### 聊天接口

**端点：** `POST /api/qwen/chat`

**请求体：**

```json
{
  "prompt": "你好，请介绍一下自己",
  "options": {
    "temperature": 0.7,
    "max_tokens": 1500,
    "top_p": 0.9
  }
}
```

**参数说明：**

- `prompt`: (必需) 字符串类型，用户输入的提示语
- `options`: (可选) 对象类型，包含以下可选参数：
  - `temperature`: 浮点数，控制随机性，范围0-1，默认0.7
  - `max_tokens`: 整数，生成的最大token数，默认1500
  - `top_p`: 浮点数，核采样阈值，范围0-1，默认0.9

**成功响应：**

```json
{
  "success": true,
  "data": {
    // 通义千问API的完整响应
  }
}
```

**错误响应：**

```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误信息"
}
```

### 健康检查接口

**端点：** `GET /health`

**成功响应：**

```json
{
  "status": "ok",
  "message": "API服务正常运行"
}
```

## 示例调用

使用curl:

```bash
curl -X POST http://localhost:3000/api/qwen/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"你好，请介绍一下自己"}'
```

使用JavaScript Fetch:

```javascript
async function callQwenAPI() {
  const response = await fetch('http://localhost:3000/api/qwen/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: '你好，请介绍一下自己',
      options: {
        temperature: 0.7,
        max_tokens: 1500
      }
    }),
  });

  const data = await response.json();
  return data;
}

callQwenAPI().then(data => console.log(data));
```

## 生产环境部署

### 在宝塔面板上部署

1. 上传项目代码到服务器
2. 在宝塔面板中安装PM2管理器
3. 创建新的Node.js项目，设置启动文件为`src/server.js`
4. 确保创建并正确配置`.env`文件
5. 启动项目

### 在Vercel上部署（推荐）

项目已配置好Vercel部署所需的文件，可以直接部署到Vercel平台：

1. 将项目推送到GitHub仓库
2. 在Vercel控制台导入GitHub仓库
3. 设置环境变量：`GPT_API_KEY`和`GPT_API_URL`
4. 点击部署

详细的Vercel部署指南请参考项目中的`VERCEL_DEPLOYMENT_GUIDE.md`文件。

### 部署到GitHub

如果您想将项目部署到GitHub，请参考项目中的`GITHUB_DEPLOYMENT_GUIDE.md`文件，其中包含详细的步骤说明。

## 注意事项

- 请确保您的API密钥安全，不要将其提交到代码仓库
- 在生产环境中，建议使用HTTPS来保护API调用
- 监控API使用情况，避免超出配额限制

## 许可证

ISC