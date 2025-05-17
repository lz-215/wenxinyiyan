# GitHub 部署指南

本指南将帮助您将项目部署到GitHub，并可选择性地从GitHub部署到Vercel。

## 前提条件

- 安装 [Git](https://git-scm.com/downloads)
- 拥有 [GitHub](https://github.com/) 账户
- 可选：安装 [GitHub Desktop](https://desktop.github.com/)（如果您不熟悉命令行Git操作）

## 方法一：使用命令行Git（适合熟悉Git命令的用户）

### 步骤1：初始化Git仓库

在项目根目录中打开命令行终端，执行以下命令：

```bash
git init
```

### 步骤2：添加文件到暂存区

```bash
git add .
```

### 步骤3：提交更改

```bash
git commit -m "初始提交"
```

### 步骤4：在GitHub上创建新仓库

1. 登录您的GitHub账户
2. 点击右上角的"+"图标，选择"New repository"
3. 输入仓库名称（例如"gpt41-project"）
4. 保持仓库为公开或私有（根据您的需求）
5. 不要初始化仓库（不要添加README、.gitignore或许可证）
6. 点击"Create repository"

### 步骤5：连接本地仓库到GitHub

GitHub将显示命令行指令。复制并执行以下命令（替换为您的仓库URL）：

```bash
git remote add origin https://github.com/您的用户名/您的仓库名.git
git branch -M main
git push -u origin main
```

## 方法二：使用GitHub Desktop（适合Git命令行不熟悉的用户）

### 步骤1：安装并打开GitHub Desktop

下载并安装[GitHub Desktop](https://desktop.github.com/)，然后登录您的GitHub账户。

### 步骤2：添加本地仓库

1. 点击"File" > "Add local repository"
2. 浏览并选择您的项目文件夹
3. 如果项目尚未初始化为Git仓库，GitHub Desktop会提示您创建一个仓库
4. 点击"Create a Repository"

### 步骤3：初始提交

1. 在GitHub Desktop中，您会看到所有待提交的更改
2. 在左下角输入提交信息，例如"初始提交"
3. 点击"Commit to main"

### 步骤4：发布到GitHub

1. 点击"Publish repository"
2. 输入仓库名称（例如"gpt41-project"）
3. 选择是否将仓库设为私有
4. 点击"Publish repository"

## 从GitHub部署到Vercel（可选）

如果您想将项目从GitHub部署到Vercel，请按照以下步骤操作：

### 步骤1：登录Vercel

访问[Vercel](https://vercel.com/)并使用GitHub账户登录。

### 步骤2：导入项目

1. 点击"Add New..." > "Project"
2. 从列表中选择您刚刚创建的GitHub仓库
3. 点击"Import"

### 步骤3：配置项目

1. 保留默认设置或根据需要进行调整
2. 在"Environment Variables"部分，添加以下环境变量：
   - `QWEN_API_KEY`: 您的通义千问API密钥
   - `QWEN_API_URL`: API URL（默认为https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation）
3. 点击"Deploy"

### 步骤4：等待部署完成

Vercel将自动构建和部署您的项目。完成后，您将获得一个可访问的URL。

## 更新项目

### 使用命令行Git

```bash
# 拉取最新更改（如果有多人协作）
git pull

# 添加更改
git add .

# 提交更改
git commit -m "更新说明"

# 推送到GitHub
git push
```

### 使用GitHub Desktop

1. 拉取最新更改（如果有多人协作）
2. 做出更改
3. 输入提交信息
4. 点击"Commit to main"
5. 点击"Push origin"

## 注意事项

- 确保`.gitignore`文件正确配置，避免将敏感信息或不必要的文件上传到GitHub
- 不要将API密钥等敏感信息直接硬编码在代码中
- 对于生产环境，建议使用环境变量来存储敏感信息
