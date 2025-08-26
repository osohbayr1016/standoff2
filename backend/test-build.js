#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting deployment test...');

// Test 1: Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found');
  process.exit(1);
}
console.log('✅ package.json found');

// Test 2: Check if all dependencies can be resolved
console.log('📦 Testing dependency installation...');
const installProcess = spawn('npm', ['install', '--production=false'], { stdio: 'inherit' });

installProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ npm install failed');
    process.exit(1);
  }
  console.log('✅ Dependencies installed successfully');
  
  // Test 3: Check if TypeScript builds without errors
  console.log('🔨 Testing TypeScript build...');
  const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
  
  buildProcess.on('close', (buildCode) => {
    if (buildCode !== 0) {
      console.error('❌ TypeScript build failed');
      process.exit(1);
    }
    console.log('✅ TypeScript build successful');
    
    // Test 4: Check if dist files exist
    if (!fs.existsSync('dist/index.js')) {
      console.error('❌ dist/index.js not found after build');
      process.exit(1);
    }
    console.log('✅ Built files exist');
    
    // Test 5: Test if the server can start (quick test)
    console.log('🚀 Testing server startup...');
    const serverProcess = spawn('node', ['dist/index.js'], { 
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PORT: '9999' }
    });
    
    let serverOutput = '';
    serverProcess.stdout.on('data', (data) => {
      serverOutput += data.toString();
    });
    
    serverProcess.stderr.on('data', (data) => {
      serverOutput += data.toString();
    });
    
    // Give server 5 seconds to start
    setTimeout(() => {
      serverProcess.kill();
      
      if (serverOutput.includes('Error') || serverOutput.includes('Cannot find module')) {
        console.error('❌ Server startup failed:');
        console.error(serverOutput);
        process.exit(1);
      }
      
      console.log('✅ Server startup test passed');
      console.log('🎉 All tests passed! Ready for deployment.');
      process.exit(0);
    }, 5000);
    
    serverProcess.on('error', (err) => {
      console.error('❌ Server startup error:', err.message);
      process.exit(1);
    });
  });
});

installProcess.on('error', (err) => {
  console.error('❌ npm install error:', err.message);
  process.exit(1);
});
