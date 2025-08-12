#!/bin/bash

echo "🔨 Building E-Sport Connection Backend"
echo "======================================"

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Compiling TypeScript..."
npm run build

# Check if build was successful
if [ -d "dist" ] && [ -f "dist/index.js" ]; then
    echo "✅ Build successful!"
    echo "📁 Build contents:"
    ls -la dist/
    echo ""
    echo "🚀 Ready for deployment!"
else
    echo "❌ Build failed!"
    echo "📋 Build logs:"
    npm run build
    exit 1
fi
