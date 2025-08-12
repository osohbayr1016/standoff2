#!/bin/bash

echo "🔐 Generating Secure Secrets for E-Sport Connection"
echo "=================================================="
echo ""

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 64)
echo "JWT_SECRET:"
echo "$JWT_SECRET"
echo ""

# Generate Session Secret
SESSION_SECRET=$(openssl rand -base64 64)
echo "SESSION_SECRET:"
echo "$SESSION_SECRET"
echo ""

echo "📋 Copy these values to your Render environment variables:"
echo ""
echo "NODE_ENV=production"
echo "MONGODB_URI=mongodb+srv://osohbayar:U4c8befcf18ca@mentormeet.xfipt6t.mongodb.net/e-sport-connection"
echo "JWT_SECRET=$JWT_SECRET"
echo "SESSION_SECRET=$SESSION_SECRET"
echo "FRONTEND_URL=https://e-sport-connection.vercel.app"
echo "CLOUDINARY_CLOUD_NAME=djvjsyzgw"
echo "CLOUDINARY_API_KEY=396391753612689"
echo "CLOUDINARY_API_SECRET=l6JGNuzvd28lEJXTlObDzHDtMIc"
echo ""
echo "✅ Secrets generated successfully!"
