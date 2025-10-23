#!/bin/bash

echo "🚀 E-Sport Connection Backend - Production Deployment"
echo "====================================================="

# Exit on any error
set -e

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm ci --production=false

echo "🔨 Building TypeScript..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build contents:"
ls -la dist/

echo "🚀 Ready for deployment!"