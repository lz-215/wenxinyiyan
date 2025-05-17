@echo off
echo Starting Vercel deployment...

REM Install Vercel CLI if not already installed
call npm install -g vercel

REM Deploy to Vercel with environment variables
echo Deploying to Vercel...
call vercel --prod --confirm --token YOUR_VERCEL_TOKEN --yes --env QWEN_API_KEY=sk-c78ff1c1f9dc469992497b2b678f8657 --env QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation

echo Deployment process completed.
pause
