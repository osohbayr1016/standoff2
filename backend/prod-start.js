#!/usr/bin/env node

console.log('🚀 Starting E-Sport Connection Backend in Production Mode');
console.log('========================================================');

// Load environment variables
require('dotenv').config();

// Check if dist/index.js exists
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist', 'index.js');

if (!fs.existsSync(indexPath)) {
    console.error('❌ Error: dist/index.js not found. Please run "npm run build" first.');
    process.exit(1);
}

console.log('✅ Found dist/index.js');
console.log('📋 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'will use 8000');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'set' : 'not set');

// Start the application
console.log('🚀 Starting application...');
require('./dist/index.js');
