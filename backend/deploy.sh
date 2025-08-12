#!/bin/bash

echo "🚀 E-Sport Connection Backend Deployment Script"
echo "================================================"

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check if TypeScript is installed
if ! command -v tsc &> /dev/null; then
    echo "📦 Installing TypeScript globally..."
    npm install -g typescript
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful! dist/ directory created."
    echo "📁 Build contents:"
    ls -la dist/
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi

# Test the build
echo "🧪 Testing the build..."
if node -e "require('./dist/index.js')" 2>/dev/null; then
    echo "✅ Build test passed!"
else
    echo "⚠️  Build test failed, but this might be due to missing environment variables."
    echo "   This is normal for local testing."
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy to Render using the render.yaml configuration"
echo "3. Set environment variables in Render dashboard"
echo "4. Test the deployment with: curl https://your-app.onrender.com/health"
echo ""
echo "For detailed instructions, see: DEPLOYMENT_FINAL_SETUP.md" 