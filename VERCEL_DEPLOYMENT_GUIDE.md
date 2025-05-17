# Comprehensive Vercel Deployment Guide

This guide provides detailed instructions for deploying your GPT4.1 project to Vercel using both the web dashboard and CLI methods.

## Method 1: Vercel Web Dashboard (Recommended)

### Step 1: Prepare Your Project Files

Your project is already configured with:
- `vercel.json` with build and route configurations
- Environment variables in the `.env` file

### Step 2: Create a ZIP Archive of Your Project

1. Select all files in your project directory
2. Right-click and select "Send to" > "Compressed (zipped) folder"
3. Name the ZIP file (e.g., "gpt41-project.zip")

### Step 3: Access Vercel Dashboard

1. Open your web browser and go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Log in with your Vercel account (or create one if you don't have it)

### Step 4: Import Your Project

1. Click on the "Add New..." button and select "Project"
2. In the "Import Git Repository" section, click on "Upload" at the bottom
3. Select the ZIP file you created in Step 2
4. Click "Open" to upload your project

### Step 5: Configure Project Settings

1. Project Name: Enter a name for your project (e.g., "gpt41-assistant")
2. Framework Preset: Select "Other" since we have a custom configuration
3. Root Directory: Keep as default (/)
4. Build and Output Settings: Leave as default (configured in vercel.json)

### Step 6: Configure Environment Variables

Add the following environment variables:
- `QWEN_API_KEY`: sk-c78ff1c1f9dc469992497b2b678f8657
- `QWEN_API_URL`: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
- `NODE_ENV`: production

### Step 7: Deploy

1. Click the "Deploy" button
2. Wait for the deployment to complete (usually takes 1-2 minutes)
3. Once deployed, Vercel will provide you with a URL to access your application

## Method 2: Using Vercel CLI (Alternative)

If you prefer using the command line, follow these steps:

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

### Step 3: Deploy Your Project

Run the following command in your project directory:

```bash
vercel --prod
```

During the deployment process, you'll be prompted to:
1. Set up and deploy your project
2. Link to an existing project or create a new one
3. Confirm deployment settings
4. Set environment variables

### Step 4: Set Environment Variables

When prompted, add the following environment variables:
- `QWEN_API_KEY`: sk-c78ff1c1f9dc469992497b2b678f8657
- `QWEN_API_URL`: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
- `NODE_ENV`: production

## Troubleshooting

### Common Issues and Solutions

1. **Deployment Fails with Build Errors**
   - Check the build logs in the Vercel dashboard
   - Ensure all dependencies are correctly listed in package.json
   - Verify that your vercel.json configuration is correct

2. **API Calls Not Working**
   - Confirm environment variables are correctly set
   - Check that your API key is valid
   - Verify the API URL is correct

3. **Static Assets Not Loading**
   - Ensure paths to assets are relative
   - Check that assets are included in the builds section of vercel.json

4. **Interactive CLI Not Working**
   - Use the web dashboard method instead
   - Try running the CLI in a different terminal
   - Update the Vercel CLI to the latest version

## After Deployment

### Verify Your Application

1. Visit the provided Vercel URL
2. Test the chat functionality
3. Check that all pages and features work correctly

### Custom Domain (Optional)

To add a custom domain:
1. Go to your project settings in the Vercel dashboard
2. Navigate to the "Domains" section
3. Add your custom domain and follow the DNS configuration instructions

### Continuous Deployment

For future updates:
1. Make changes to your local project
2. Re-deploy using the same process
3. Or set up Git integration for automatic deployments

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains in Vercel](https://vercel.com/docs/concepts/projects/domains)
