# Vercel部署指南

本文档提供了将GPT4.1项目部署到Vercel的详细步骤。

## 前提条件

1. 拥有一个[Vercel账户](https://vercel.com/signup)
2. 安装[Git](https://git-scm.com/downloads)
3. 拥有一个[GitHub账户](https://github.com/join)（可选，但推荐）

## 部署步骤

### 方法1：使用Vercel CLI（命令行工具）

1. **安装Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **登录到Vercel**

   ```bash
   vercel login
   ```

3. **部署项目**

   在项目根目录下运行：

   ```bash
   vercel
   ```

   按照提示操作，设置项目名称和其他配置。

4. **设置环境变量**

   在Vercel部署过程中，系统会询问是否要设置环境变量。请确保设置以下环境变量：

   - `QWEN_API_KEY`: 您的通义千问API密钥
   - `QWEN_API_URL`: 通义千问API的URL（默认为`https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`）
   - `NODE_ENV`: 设置为`production`

### 方法2：通过Vercel网站部署（推荐）

1. **将项目推送到GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/您的用户名/项目名称.git
   git push -u origin main
   ```

2. **在Vercel上导入项目**

   - 访问[Vercel控制台](https://vercel.com/dashboard)
   - 点击"New Project"
   - 选择您的GitHub仓库
   - 点击"Import"

3. **配置项目**

   - 在"Configure Project"页面，展开"Environment Variables"部分
   - 添加以下环境变量：
     - `QWEN_API_KEY`: 您的通义千问API密钥
     - `QWEN_API_URL`: 通义千问API的URL
     - `NODE_ENV`: `production`
   - 点击"Deploy"按钮

4. **等待部署完成**

   Vercel会自动构建和部署您的项目。部署完成后，您将获得一个可访问的URL。

## 自定义域名（可选）

1. 在Vercel项目控制台中，点击"Settings"
2. 选择"Domains"
3. 添加您的自定义域名并按照指示完成DNS配置

## 部署后的维护

### 更新部署

当您对代码进行更改后，只需将更改推送到GitHub仓库，Vercel将自动重新部署您的项目：

```bash
git add .
git commit -m "更新描述"
git push
```

### 查看日志

在Vercel控制台中，您可以通过以下步骤查看应用程序日志：

1. 选择您的项目
2. 点击最新的部署
3. 选择"Functions"选项卡
4. 点击任何函数查看其日志

## 故障排除

1. **API调用失败**
   - 检查环境变量是否正确设置
   - 确认API密钥是否有效
   - 查看Vercel函数日志以获取详细错误信息

2. **静态资源加载失败**
   - 确保所有资源路径使用相对路径
   - 检查vercel.json中的路由配置是否正确

3. **部署失败**
   - 检查构建日志以了解失败原因
   - 确保package.json中的依赖项和脚本正确配置

## 其他资源

- [Vercel文档](https://vercel.com/docs)
- [Node.js on Vercel](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js)
- [环境变量和密钥](https://vercel.com/docs/concepts/projects/environment-variables)
