#!/bin/bash

echo "🔧 Starting build process..."

# Clean install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Check if node_modules exists and has the required packages
echo "🔍 Checking dependencies..."
if [ ! -d "node_modules/mongoose" ]; then
    echo "❌ mongoose not found, installing..."
    npm install mongoose
fi

if [ ! -d "node_modules/socket.io" ]; then
    echo "❌ socket.io not found, installing..."
    npm install socket.io
fi

if [ ! -d "node_modules/cloudinary" ]; then
    echo "❌ cloudinary not found, installing..."
    npm install cloudinary
fi

if [ ! -d "node_modules/@fastify/multipart" ]; then
    echo "❌ @fastify/multipart not found, installing..."
    npm install @fastify/multipart
fi

# Build the project
echo "🔨 Building TypeScript..."
npm run build

echo "✅ Build completed!"
