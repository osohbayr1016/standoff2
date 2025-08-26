#!/usr/bin/env node

// Prebuild script to ensure all dependencies are properly resolved
console.log('🔍 Checking TypeScript and dependency resolution...');

// Check if required packages exist
const fs = require('fs');
const path = require('path');

const requiredPackages = [
  'fastify',
  '@fastify/cors',
  'typescript'
];

let allPackagesFound = true;

requiredPackages.forEach(pkg => {
  const packagePath = path.join(__dirname, 'node_modules', pkg);
  if (!fs.existsSync(packagePath)) {
    console.error(`❌ Missing package: ${pkg}`);
    allPackagesFound = false;
  } else {
    console.log(`✅ Found package: ${pkg}`);
  }
});

if (allPackagesFound) {
  console.log('🎉 All required packages are present!');
  process.exit(0);
} else {
  console.error('❌ Some packages are missing. This may cause build failures.');
  process.exit(1);
}
