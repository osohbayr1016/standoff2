#!/usr/bin/env node

/**
 * Production start script for Render deployment
 * This script ensures the correct path resolution
 */

const path = require('path');
const fs = require('fs');

// Try multiple possible paths for the built application
const possiblePaths = [
    path.join(__dirname, 'dist', 'index.js'),           // Current directory
    path.join(__dirname, 'backend', 'dist', 'index.js'), // Backend subdirectory
    path.join(process.cwd(), 'dist', 'index.js'),       // Working directory
    path.join(process.cwd(), 'backend', 'dist', 'index.js') // Working directory + backend
];

let appPath = null;

console.log('🔍 Looking for built application...');
console.log('Current directory:', __dirname);
console.log('Working directory:', process.cwd());

for (const testPath of possiblePaths) {
    console.log(`Checking: ${testPath}`);
    if (fs.existsSync(testPath)) {
        appPath = testPath;
        console.log(`✅ Found application at: ${appPath}`);
        break;
    }
}

if (!appPath) {
    console.error('❌ Could not find dist/index.js in any expected location');
    console.error('Expected locations:');
    possiblePaths.forEach(p => console.error(`  - ${p}`));
    process.exit(1);
}

// Start the application
console.log(`🚀 Starting application from: ${appPath}`);
require(appPath);