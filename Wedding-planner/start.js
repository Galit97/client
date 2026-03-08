const fs = require('fs');
const path = require('path');

console.log('Starting server...');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// Check multiple possible paths for the server.js file
const possiblePaths = [
  path.join(__dirname, 'dist', 'server.js'),
  path.join(process.cwd(), 'dist', 'server.js'),
  path.join(process.cwd(), 'server', 'dist', 'server.js'),
  path.join(__dirname, 'server.js')
];

let serverPath = null;
for (const testPath of possiblePaths) {
  console.log('Checking path:', testPath);
  if (fs.existsSync(testPath)) {
    serverPath = testPath;
    console.log('✅ Found server.js at:', serverPath);
    break;
  }
}

if (!serverPath) {
  console.error('❌ Could not find server.js in any of the expected locations:');
  possiblePaths.forEach(p => console.error('  -', p));
  console.error('Current directory contents:');
  try {
    const files = fs.readdirSync(process.cwd());
    files.forEach(file => console.error('  -', file));
  } catch (err) {
    console.error('  Error reading directory:', err.message);
  }
  process.exit(1);
}

// Start the server
console.log('🚀 Starting server from:', serverPath);
require(serverPath);
