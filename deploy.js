const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute shell commands
function executeCommand(command) {
  try {
    console.log(`Executing: ${command}`);
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Main deployment function
async function deploy() {
  console.log('Starting deployment to Vercel...');
  
  // Check if vercel CLI is installed
  try {
    executeCommand('vercel --version');
  } catch (error) {
    console.log('Vercel CLI not found. Installing...');
    executeCommand('npm install -g vercel');
  }
  
  // Deploy to Vercel with environment variables
  console.log('Deploying to Vercel...');
  const deployCommand = 'vercel --prod --confirm';
  
  const result = executeCommand(deployCommand);
  
  if (result) {
    console.log('Deployment successful!');
    
    // Extract the deployment URL from the result
    const urlMatch = result.match(/https:\/\/[a-zA-Z0-9.-]+\.vercel\.app/);
    if (urlMatch) {
      const deploymentUrl = urlMatch[0];
      console.log(`Your application is deployed at: ${deploymentUrl}`);
    } else {
      console.log('Could not extract deployment URL from the output.');
    }
  } else {
    console.error('Deployment failed.');
  }
}

// Run the deployment
deploy().catch(console.error);
