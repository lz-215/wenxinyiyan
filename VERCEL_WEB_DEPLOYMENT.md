# Vercel Web Dashboard Deployment Guide

This guide provides step-by-step instructions for deploying your GPT4.1 project directly through the Vercel web dashboard.

## Step 1: Prepare Your Project

Your project is already configured with the necessary files for Vercel deployment:
- `vercel.json` with build and route configurations
- Environment variables in the `.env` file

## Step 2: Access Vercel Dashboard

1. Open your web browser and go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Log in with your Vercel account (or create one if you don't have it)

## Step 3: Import Your Project

1. Click on the "Add New..." button and select "Project"
2. Choose the option to import from your local project
3. Follow the instructions to upload your project files

## Step 4: Configure Project Settings

1. Project Name: Enter a name for your project (e.g., "gpt41-assistant")
2. Framework Preset: Select "Other" since we have a custom configuration
3. Root Directory: Keep as default (/)
4. Build Command: Leave empty (configured in vercel.json)
5. Output Directory: Leave empty (configured in vercel.json)

## Step 5: Configure Environment Variables

Add the following environment variables:
- `QWEN_API_KEY`: sk-c78ff1c1f9dc469992497b2b678f8657
- `QWEN_API_URL`: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
- `NODE_ENV`: production

## Step 6: Deploy

1. Click the "Deploy" button
2. Wait for the deployment to complete
3. Once deployed, Vercel will provide you with a URL to access your application

## Step 7: Verify Deployment

1. Visit the provided URL to ensure your application is working correctly
2. Test the chat functionality to confirm API integration is working

## Troubleshooting

If you encounter any issues:

1. Check the deployment logs in the Vercel dashboard
2. Verify that all environment variables are correctly set
3. Ensure your API key is valid and has the necessary permissions

## Custom Domain (Optional)

To add a custom domain to your project:

1. Go to your project settings in the Vercel dashboard
2. Navigate to the "Domains" section
3. Add your custom domain and follow the DNS configuration instructions

## Continuous Deployment

For future updates:
1. Make changes to your local project
2. Re-deploy using the same process or set up Git integration for automatic deployments
