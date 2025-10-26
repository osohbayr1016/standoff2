#!/usr/bin/env node

/**
 * Production start script for Render deployment
 * This script ensures the correct path resolution and handles build issues
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Production Start Script - Debugging Info');
console.log('==========================================');
console.log('Current directory:', __dirname);
console.log('Working directory:', process.cwd());
console.log('Node version:', process.version);
console.log('Platform:', process.platform);

// Check if we're in the right directory structure
console.log('\n📁 Directory Structure:');
const checkDir = (dirPath, label) => {
    try {
        const stats = fs.statSync(dirPath);
        console.log(`${label}: ${dirPath} (${stats.isDirectory() ? 'DIR' : 'FILE'})`);
        if (stats.isDirectory()) {
            const contents = fs.readdirSync(dirPath);
            console.log(`  Contents: ${contents.slice(0, 5).join(', ')}${contents.length > 5 ? '...' : ''}`);
        }
    } catch (error) {
        console.log(`${label}: ${dirPath} (NOT FOUND)`);
    }
};

checkDir(path.join(__dirname, 'dist'), 'dist/');
checkDir(path.join(__dirname, 'src'), 'src/');
checkDir(path.join(__dirname, 'package.json'), 'package.json');
checkDir(path.join(__dirname, 'tsconfig.json'), 'tsconfig.json');

// Try to build if dist doesn't exist
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
    console.log('\n🔨 dist/ directory not found, attempting to build...');
    try {
        console.log('Running: npm run build');
        execSync('npm run build', { 
            cwd: __dirname, 
            stdio: 'inherit',
            timeout: 60000 
        });
        console.log('✅ Build completed');
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        console.log('\n🔍 Checking for TypeScript installation...');
        try {
            execSync('npx tsc --version', { cwd: __dirname, stdio: 'inherit' });
        } catch (tsError) {
            console.error('❌ TypeScript not available:', tsError.message);
        }
    }
}

// Try multiple possible paths for the built application
const possiblePaths = [
    path.join(__dirname, 'dist', 'index.js'),           // Current directory
    path.join(__dirname, 'backend', 'dist', 'index.js'), // Backend subdirectory
    path.join(process.cwd(), 'dist', 'index.js'),       // Working directory
    path.join(process.cwd(), 'backend', 'dist', 'index.js'), // Working directory + backend
    path.join('/opt/render/project', 'backend', 'dist', 'index.js'), // Render absolute path
    path.join('/opt/render/project', 'dist', 'index.js') // Render root dist
];

let appPath = null;

console.log('\n🔍 Looking for built application...');
for (const testPath of possiblePaths) {
    console.log(`Checking: ${testPath}`);
    if (fs.existsSync(testPath)) {
        appPath = testPath;
        console.log(`✅ Found application at: ${appPath}`);
        break;
    }
}

if (!appPath) {
    console.error('\n❌ Could not find dist/index.js in any expected location');
    console.error('Expected locations:');
    possiblePaths.forEach(p => console.error(`  - ${p}`));
    
    console.log('\n🔍 Additional debugging:');
    console.log('Environment variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PWD:', process.env.PWD);
    
    console.log('\nTrying to list all files in current directory:');
    try {
        const files = fs.readdirSync(__dirname);
        console.log('Files:', files.join(', '));
    } catch (error) {
        console.error('Error listing files:', error.message);
    }
    
    process.exit(1);
}

// Start the application
console.log(`\n🚀 Starting application from: ${appPath}`);
try {
    require(appPath);
} catch (error) {
    console.error('❌ Failed to start application:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}