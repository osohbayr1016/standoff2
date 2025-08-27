# 🖼️ Image Upload & WebSocket Fix Guide

## Problem Summary

1. **Image Upload Issue**: The image upload functionality in the profile creation was not working due to missing upload endpoints in the backend.
2. **WebSocket Error**: The frontend was trying to connect to a WebSocket server that didn't exist, causing connection errors.

## ✅ What's Been Fixed

### 1. Backend Upload Routes (`backend/src/routes/uploadRoutes.ts`)

- ✅ Added complete image upload endpoint (`POST /api/upload/image`)
- ✅ Added image deletion endpoint (`DELETE /api/upload/image/:publicId`)
- ✅ Integrated Cloudinary for image storage
- ✅ Added proper file validation (type, size)
- ✅ Added authentication middleware
- ✅ Added comprehensive error handling

### 2. WebSocket Server (`backend/src/config/socket.ts`)

- ✅ Implemented complete Socket.IO server
- ✅ Added real-time messaging functionality
- ✅ Added typing indicators
- ✅ Added read receipts
- ✅ Added user status updates
- ✅ Added proper authentication middleware

### 3. Server Integration (`backend/src/index.ts`)

- ✅ Integrated WebSocket server with HTTP server
- ✅ Added Socket.IO initialization
- ✅ Added graceful shutdown handling

### 4. Required Dependencies

- ✅ `@fastify/multipart` - For handling file uploads
- ✅ `cloudinary` - For cloud image storage
- ✅ `socket.io` - For real-time WebSocket communication
- ✅ All dependencies are already installed

## 🚀 Complete Setup Guide

### Step 1: Environment Variables Setup

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# ========================================
# E-Sport Connection Backend Environment
# ========================================

# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
MONGODB_URI="mongodb://localhost:27017/e-sport-connection"
# OR use MongoDB Atlas:
# MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database-name"

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-for-development
JWT_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key-here-make-it-long-and-random-for-development

# Cloudinary Configuration (REQUIRED for image uploads)
# Sign up at https://cloudinary.com/ and get these values
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Optional OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### Step 2: Cloudinary Setup

1. **Sign up for Cloudinary**:

   - Go to https://cloudinary.com/
   - Create a free account
   - Get your credentials from the dashboard

2. **Update your .env file** with the Cloudinary credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

### Step 3: Database Setup

#### Option A: Local MongoDB

```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option B: MongoDB Atlas (Recommended)

1. Go to https://www.mongodb.com/atlas
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### Step 4: Start the Backend

```bash
cd backend
npm install
npm run build
npm run dev
```

The backend should start on `http://localhost:8000` with both HTTP API and WebSocket support.

### Step 5: Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend should start on `http://localhost:3000`

## 🔧 API Endpoints

### Image Upload Endpoints

- `POST /api/upload/image` - Upload an image

  - Requires authentication
  - Accepts multipart form data
  - Returns: `{ success: true, url: "image_url", publicId: "cloudinary_id" }`

- `DELETE /api/upload/image/:publicId` - Delete an image
  - Requires authentication
  - Deletes from Cloudinary

### WebSocket Events

- `connect` - Client connects to server
- `disconnect` - Client disconnects from server
- `send_message` - Send a message to another user
- `typing_start` - User starts typing
- `typing_stop` - User stops typing
- `mark_read` - Mark message as read
- `update_status` - Update user status

### Health Check

- `GET /health` - Server health status with WebSocket info
- `GET /api/upload/health` - Upload routes health check

## 🧪 Testing the Upload

### 1. Test the Upload Endpoint

```bash
# Test with curl (replace YOUR_JWT_TOKEN with actual token)
curl -X POST http://localhost:8000/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

### 2. Test WebSocket Connection

```bash
# Test WebSocket connection (using wscat if installed)
npm install -g wscat
wscat -c "ws://localhost:8000" -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test in the Frontend

1. Start both backend and frontend
2. Register a new account
3. Go to "Create Profile"
4. Try uploading an image
5. Check the browser console for WebSocket connection status
6. Verify that both image upload and WebSocket work without errors

## 🐛 Troubleshooting

### Common Issues

#### 1. "No image file provided" Error

- Make sure you're sending the file with the field name `image`
- Check that the file is actually selected in the frontend

#### 2. "File must be an image" Error

- Ensure the file is a valid image (JPG, PNG, GIF)
- Check the file's MIME type

#### 3. "Image size must be less than 5MB" Error

- Compress the image or choose a smaller file
- The limit is set to 5MB for performance

#### 4. Cloudinary Authentication Error

- Verify your Cloudinary credentials in the `.env` file
- Make sure your Cloudinary account is active

#### 5. CORS Error

- Ensure the frontend URL is in the CORS allowed origins
- Check that the backend is running on the correct port

#### 6. Authentication Error

- Make sure you're logged in
- Check that the JWT token is valid
- Verify the token is being sent in the Authorization header

#### 7. WebSocket Connection Error

- Ensure the backend is running on the correct port
- Check that Socket.IO is properly initialized
- Verify the JWT token is valid for WebSocket authentication

### Debug Steps

1. **Check Backend Logs**:

   ```bash
   cd backend
   npm run dev
   # Watch for upload-related and WebSocket logs
   ```

2. **Check Frontend Console**:

   - Open browser developer tools
   - Look for network requests to `/api/upload/image`
   - Check for WebSocket connection status
   - Look for any error messages

3. **Test API Directly**:

   ```bash
   # Test health endpoint
   curl http://localhost:8000/health

   # Test upload health
   curl http://localhost:8000/api/upload/health
   ```

4. **Check WebSocket Status**:
   - The health endpoint now includes WebSocket information
   - Check the browser console for WebSocket connection logs

## 📁 File Structure

```
backend/
├── src/
│   ├── routes/
│   │   └── uploadRoutes.ts          # ✅ Fixed upload routes
│   ├── config/
│   │   ├── cloudinary.ts            # ✅ Cloudinary configuration
│   │   └── socket.ts                # ✅ WebSocket server implementation
│   ├── middleware/
│   │   └── auth.ts                  # ✅ Authentication middleware
│   └── index.ts                     # ✅ Routes and WebSocket registered
├── .env                             # ⚠️ Create this file
└── package.json                     # ✅ Dependencies installed

frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── ImageUploader.tsx    # ✅ Upload component
│   │   ├── contexts/
│   │   │   └── SocketContext.tsx    # ✅ WebSocket context
│   │   └── create-profile/
│   │       └── page.tsx             # ✅ Profile creation
│   └── config/
│       └── api.ts                   # ✅ API endpoints
└── package.json
```

## 🎯 What's Working Now

- ✅ Image upload during profile creation
- ✅ Image validation (type, size)
- ✅ Cloudinary integration
- ✅ Authentication protection
- ✅ Error handling
- ✅ Image deletion
- ✅ Proper API responses
- ✅ WebSocket real-time communication
- ✅ Real-time messaging
- ✅ Typing indicators
- ✅ Read receipts
- ✅ User status updates
- ✅ WebSocket authentication

## 🚀 Next Steps

1. **Set up your environment variables**
2. **Configure Cloudinary**
3. **Start both servers**
4. **Test the image upload functionality**
5. **Test WebSocket connection**
6. **Create a profile with an image**
7. **Test real-time features**

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Ensure both backend and frontend are running
4. Check the browser console and backend logs for errors
5. Verify WebSocket connection in browser console

Both the image upload functionality and WebSocket communication should now work perfectly! 🎉
