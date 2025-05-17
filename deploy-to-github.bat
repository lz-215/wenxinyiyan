@echo off
echo ===================================
echo    GitHub 部署助手
echo ===================================
echo.

REM 检查Git是否安装
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未检测到Git安装。请先安装Git: https://git-scm.com/downloads
    goto :EOF
)

echo 检测到Git已安装，继续...
echo.

REM 初始化Git仓库（如果尚未初始化）
if not exist .git (
    echo 正在初始化Git仓库...
    git init
    if %ERRORLEVEL% NEQ 0 (
        echo 错误: 无法初始化Git仓库。
        goto :EOF
    )
    echo Git仓库初始化成功。
) else (
    echo Git仓库已存在，跳过初始化步骤。
)
echo.

REM 添加所有文件到暂存区
echo 正在添加文件到Git暂存区...
git add .
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 无法添加文件到Git暂存区。
    goto :EOF
)
echo 文件已成功添加到暂存区。
echo.

REM 提交更改
set /p commit_message=请输入提交信息（默认为"初始提交"）: 
if "%commit_message%"=="" set commit_message=初始提交

echo 正在提交更改...
git commit -m "%commit_message%"
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 无法提交更改。
    goto :EOF
)
echo 更改已成功提交。
echo.

REM 检查是否已设置远程仓库
git remote -v | findstr "origin" >nul
if %ERRORLEVEL% NEQ 0 (
    echo 未检测到远程仓库。
    echo.
    echo 请在GitHub上创建一个新仓库，然后输入仓库URL:
    echo 例如: https://github.com/用户名/仓库名.git
    echo.
    set /p repo_url=仓库URL: 
    
    if "%repo_url%"=="" (
        echo 错误: 未提供仓库URL。
        goto :EOF
    )
    
    echo 正在添加远程仓库...
    git remote add origin %repo_url%
    if %ERRORLEVEL% NEQ 0 (
        echo 错误: 无法添加远程仓库。
        goto :EOF
    )
    echo 远程仓库已成功添加。
) else (
    echo 检测到已配置的远程仓库。
)
echo.

REM 推送到GitHub
echo 正在推送到GitHub...
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo 尝试推送到master分支...
    git push -u origin master
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo 错误: 无法推送到GitHub。可能的原因:
        echo 1. 远程仓库URL不正确
        echo 2. 没有推送权限
        echo 3. 需要先拉取远程更改
        echo.
        echo 请尝试手动解决问题后再次运行此脚本。
        goto :EOF
    )
)

echo.
echo ===================================
echo    部署成功！
echo ===================================
echo 您的代码已成功推送到GitHub仓库。
echo.
echo 如需部署到Vercel，请参考VERCEL_DEPLOYMENT_GUIDE.md文件。
echo.
pause
