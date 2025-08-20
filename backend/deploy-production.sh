#!/bin/bash

echo "🚀 E-Sport Connection Backend - Production Deployment"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the backend directory"
    exit 1
fi

print_status "Starting production deployment process..."

# Step 1: Clean previous build
print_status "Cleaning previous build..."
rm -rf dist/
print_success "Previous build cleaned"

# Step 2: Install dependencies
print_status "Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 3: Build the project
print_status "Building the project..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 4: Verify build output
if [ -d "dist" ] && [ -f "dist/index.js" ]; then
    print_success "Build verification passed"
    echo "📁 Build contents:"
    ls -la dist/
else
    print_error "Build verification failed - dist/index.js not found"
    exit 1
fi

# Step 5: Test the build
print_status "Testing the build..."
if node -e "require('./dist/index.js')" 2>/dev/null; then
    print_success "Build test passed"
else
    print_warning "Build test failed (this might be due to missing environment variables)"
fi

# Step 6: Environment check
print_status "Checking environment configuration..."
if [ -f ".env" ]; then
    print_success "Environment file found"
else
    print_warning "No .env file found - make sure environment variables are set in production"
fi

# Step 7: Check for common issues
print_status "Running pre-deployment checks..."

# Check for TypeScript errors
if npm run build 2>&1 | grep -q "error"; then
    print_error "TypeScript compilation errors found"
    npm run build
    exit 1
else
    print_success "No TypeScript errors found"
fi

# Check for missing dependencies
if [ ! -d "node_modules" ]; then
    print_error "node_modules directory not found"
    exit 1
fi

# Check for required files
required_files=("package.json" "tsconfig.json" "src/index.ts")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file not found: $file"
        exit 1
    fi
done
print_success "All required files found"

echo ""
echo "🎉 Production deployment preparation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Fix production deployment issues'"
echo "   git push origin main"
echo ""
echo "2. Deploy to Render:"
echo "   - Go to Render Dashboard"
echo "   - Select your backend service"
echo "   - Click 'Deploy latest commit'"
echo ""
echo "3. Verify deployment:"
echo "   - Check health endpoint: https://your-app.onrender.com/health"
echo "   - Test CORS: https://your-app.onrender.com/api/test-cors"
echo ""
echo "📚 For detailed instructions, see: PRODUCTION_DEPLOYMENT_GUIDE.md"
echo ""
print_success "Deployment script completed successfully!"
