const fs = require('fs');
const path = require('path');

console.log('Verifying build process...');

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ dist directory does not exist');
  process.exit(1);
}

// Check if server.js exists
const serverPath = path.join(distPath, 'server.js');
if (!fs.existsSync(serverPath)) {
  console.error('❌ dist/server.js does not exist');
  process.exit(1);
}

// Check if config/db.js exists
const dbPath = path.join(distPath, 'config', 'db.js');
if (!fs.existsSync(dbPath)) {
  console.error('❌ dist/config/db.js does not exist');
  process.exit(1);
}

// Check if routes directory exists
const routesPath = path.join(distPath, 'routes');
if (!fs.existsSync(routesPath)) {
  console.error('❌ dist/routes directory does not exist');
  process.exit(1);
}

console.log('✅ Build verification passed');
console.log('✅ All required files exist');
console.log('✅ Ready for deployment');
