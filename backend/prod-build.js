#!/usr/bin/env node

/**
 * Production build script for Render deployment
 * This script ensures the build process completes successfully
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔨 Production Build Script');
console.log('==========================');
console.log('Current directory:', __dirname);
console.log('Working directory:', process.cwd());

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, 'package.json');
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
const srcPath = path.join(__dirname, 'src');

if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found. Are you in the backend directory?');
    process.exit(1);
}

if (!fs.existsSync(tsconfigPath)) {
    console.error('❌ tsconfig.json not found. TypeScript configuration missing.');
    process.exit(1);
}

if (!fs.existsSync(srcPath)) {
    console.error('❌ src/ directory not found. Source code missing.');
    process.exit(1);
}

console.log('✅ Found required files and directories');

// Clean previous build
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    console.log('🧹 Cleaning previous build...');
    try {
        fs.rmSync(distPath, { recursive: true, force: true });
        console.log('✅ Previous build cleaned');
    } catch (error) {
        console.log('⚠️  Could not clean previous build:', error.message);
    }
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
    execSync('npm install', { 
        cwd: __dirname, 
        stdio: 'inherit',
        timeout: 300000 // 5 minutes
    });
    console.log('✅ Dependencies installed');
} catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
}

// Build TypeScript
console.log('🔨 Building TypeScript...');
try {
    execSync('npx tsc --project tsconfig.json', { 
        cwd: __dirname, 
        stdio: 'inherit',
        timeout: 120000 // 2 minutes
    });
    console.log('✅ TypeScript build completed');
} catch (error) {
    console.error('❌ TypeScript build failed:', error.message);
    process.exit(1);
}

// Verify build output
if (!fs.existsSync(distPath)) {
    console.error('❌ dist/ directory was not created');
    process.exit(1);
}

const indexPath = path.join(distPath, 'index.js');
if (!fs.existsSync(indexPath)) {
    console.error('❌ dist/index.js was not created');
    process.exit(1);
}

console.log('✅ Build verification passed');
console.log('📁 Build contents:');
try {
    const files = fs.readdirSync(distPath);
    files.forEach(file => {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        console.log(`  ${stats.isDirectory() ? '📁' : '📄'} ${file}`);
    });
} catch (error) {
    console.log('⚠️  Could not list build contents:', error.message);
}

console.log('\n🎉 Build completed successfully!');
console.log(`📄 Main file: ${indexPath}`);
