#!/bin/bash

echo "🚀 Starting E-Sport Connection Backend"
echo "======================================"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found. Building first..."
    npm run build
    if [ ! -d "dist" ]; then
        echo "❌ Build failed. Exiting."
        exit 1
    fi
fi

# Check if main file exists
if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: dist/index.js not found. Exiting."
    exit 1
fi

# Check environment variables
echo "🔧 Environment Check:"
echo "NODE_ENV: ${NODE_ENV:-not set}"
echo "MONGODB_URI: ${MONGODB_URI:-not set}"
echo "JWT_SECRET: ${JWT_SECRET:+set}"
echo "SESSION_SECRET: ${SESSION_SECRET:+set}"
echo "FRONTEND_URL: ${FRONTEND_URL:-not set}"

# Start the application
echo "🚀 Starting Node.js application..."
echo "📁 Working directory: $(pwd)"
echo "📄 Main file: dist/index.js"

# Start with Node.js
exec node dist/index.js
