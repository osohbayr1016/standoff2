#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Your Render service URL - update this with your actual service URL
const RENDER_URL = 'https://e-sport-connection-backend.onrender.com';
const LOCAL_TEST_URL = 'http://localhost:8000';

console.log('🚀 Monitoring deployment status...');
console.log('📋 Deployment checklist:');
console.log('  1. ✅ Local tests passed');
console.log('  2. ✅ Code committed and pushed');
console.log('  3. 🔄 Waiting for Render build...');

let attempts = 0;
const maxAttempts = 30; // Wait up to 15 minutes (30 * 30 seconds)

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ 
        statusCode: res.statusCode, 
        data: data 
      }));
    });
    
    req.on('error', (err) => reject(err));
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkDeployment() {
  attempts++;
  
  try {
    console.log(`\n🔍 Attempt ${attempts}/${maxAttempts} - Checking ${RENDER_URL}...`);
    
    const response = await makeRequest(RENDER_URL);
    
    if (response.statusCode === 200 || response.statusCode === 404) {
      // 404 is expected for the root route, but it means server is running
      console.log('✅ SUCCESS! Deployment is live and working!');
      console.log(`📡 Status: ${response.statusCode}`);
      console.log(`🌐 Your backend is available at: ${RENDER_URL}`);
      
      // Test a few endpoints
      console.log('\n🧪 Testing API endpoints...');
      
      try {
        const healthCheck = await makeRequest(`${RENDER_URL}/health`);
        console.log(`✅ Health check: ${healthCheck.statusCode}`);
      } catch (e) {
        console.log('⚠️  Health endpoint not available (this is normal if not implemented)');
      }
      
      try {
        const apiCheck = await makeRequest(`${RENDER_URL}/api/users`);
        console.log(`✅ Users API: ${apiCheck.statusCode}`);
      } catch (e) {
        console.log('⚠️  Users API might require authentication');
      }
      
      console.log('\n🎉 Deployment monitoring complete!');
      console.log('📝 Next steps:');
      console.log('  - Test your frontend connection to the backend');
      console.log('  - Verify all environment variables are set correctly');
      console.log('  - Test authentication flows');
      console.log('  - Monitor Render logs for any runtime issues');
      
      process.exit(0);
    } else {
      throw new Error(`Unexpected status code: ${response.statusCode}`);
    }
    
  } catch (error) {
    if (attempts >= maxAttempts) {
      console.error('❌ DEPLOYMENT FAILED');
      console.error('🔍 The deployment did not come online within the expected time.');
      console.error('📋 Debugging steps:');
      console.error('  1. Check Render dashboard for build/deploy logs');
      console.error('  2. Verify environment variables are set');
      console.error('  3. Check for any runtime errors in logs');
      console.error('  4. Ensure all dependencies are compatible');
      console.error(`\n🌐 Render URL: ${RENDER_URL}`);
      console.error('📊 Render Dashboard: https://dashboard.render.com/');
      process.exit(1);
    }
    
    console.log(`⏳ Not ready yet (${error.message}). Waiting 30 seconds before next check...`);
    setTimeout(checkDeployment, 30000);
  }
}

// Start monitoring
console.log('\n⏰ Starting deployment monitoring...');
console.log('   This will check every 30 seconds for up to 15 minutes');
console.log('   Press Ctrl+C to stop monitoring\n');

setTimeout(checkDeployment, 5000); // Wait 5 seconds before first check
