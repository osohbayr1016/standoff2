#!/bin/bash

echo "🔧 Building E-Sport Connection Backend for Production"
echo "===================================================="

# Exit on any error
set -e

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build TypeScript
echo "🔨 Compiling TypeScript..."
npx tsc --project tsconfig.json

# Verify build
if [ -f "dist/index.js" ]; then
    echo "✅ Build successful!"
    echo "📁 Build contents:"
    ls -la dist/
else
    echo "❌ Build failed - dist/index.js not found"
    exit 1
fi

echo "🚀 Ready for deployment!"
