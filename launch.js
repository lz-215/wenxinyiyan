const { execSync } = require('child_process');
const path = require('path');

// Get the current directory
const currentDir = process.cwd();

// Build the path to index.html
const indexPath = path.join(currentDir, 'index.html');

// Open index.html in the default browser
console.log('Opening index.html in your default browser...');
try {
  // For Windows
  execSync(`start "" "${indexPath}"`);
  console.log('Browser opened successfully!');
} catch (error) {
  console.error('Error opening browser:', error);
} 