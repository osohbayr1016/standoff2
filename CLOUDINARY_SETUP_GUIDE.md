# 🖼️ Cloudinary Image Upload Setup Guide

## Overview

This guide will help you set up Cloudinary image uploading and retrieval for the E-Sport Connection platform. The system has been fixed and is now ready for production use.

## ✅ What's Been Fixed

### Backend Improvements

- ✅ Fixed Cloudinary configuration with proper error handling
- ✅ Added graceful fallback when Cloudinary credentials are missing
- ✅ Improved upload routes with better error messages
- ✅ Re-enabled upload routes in main server file
- ✅ Added proper file validation and size limits

### Frontend Improvements

- ✅ Enhanced ImageUploader component with better error handling
- ✅ Added specific error messages for different failure scenarios
- ✅ Improved user feedback during upload process
- ✅ Better handling of authentication errors

## 🚀 Quick Setup

### Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account
3. Once logged in, go to your Dashboard
4. Copy your credentials from the Dashboard

### Step 2: Set Environment Variables

Create a `.env` file in the `backend` directory (if it doesn't exist):

```bash
cd backend
cp env.example .env
```

Edit the `.env` file and add your Cloudinary credentials:

```env
# Cloudinary Configuration (REQUIRED for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Example:**

```env
CLOUDINARY_CLOUD_NAME=my-e-sport-app
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456789
```

### Step 3: Start the Backend

```bash
cd backend
npm install
npm run dev
```

You should see:

```
✅ Cloudinary environment variables found
🔧 Upload routes plugin starting...
✅ Multipart plugin registered successfully
🔧 Upload routes registered with prefix /api/upload
```

### Step 4: Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing the Upload

### 1. Test Backend Health

```bash
curl http://localhost:8000/api/upload/health
```

Expected response:

```json
{
  "success": true,
  "message": "Upload routes available",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Image Upload (with authentication)

```bash
# First, get a JWT token by logging in
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Then use the token to upload an image
curl -X POST http://localhost:8000/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

### 3. Test in Frontend

1. Go to `http://localhost:3000`
2. Register a new account or log in
3. Go to "Create Profile" or edit your profile
4. Try uploading an image
5. Check that the image appears correctly

## 🔧 API Endpoints

### Upload Image

- **POST** `/api/upload/image`
- **Authentication:** Required (Bearer token)
- **Content-Type:** `multipart/form-data`
- **Body:** `image` (file)
- **Response:**
  ```json
  {
    "success": true,
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/e-sport-profiles/abc123.jpg",
    "publicId": "e-sport-profiles/abc123",
    "message": "Image uploaded successfully"
  }
  ```

### Delete Image

- **DELETE** `/api/upload/image/:publicId`
- **Authentication:** Required (Bearer token)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Image deleted successfully",
    "result": { "result": "ok" }
  }
  ```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Image upload service is not configured"

- **Cause:** Cloudinary environment variables are missing
- **Solution:** Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in your `.env` file

#### 2. "Please log in to upload images"

- **Cause:** User is not authenticated
- **Solution:** Make sure user is logged in and has a valid JWT token

#### 3. "Image too large. Please upload under 5MB"

- **Cause:** File size exceeds 5MB limit
- **Solution:** Compress the image or choose a smaller file

#### 4. "File must be an image"

- **Cause:** Uploaded file is not an image
- **Solution:** Upload a valid image file (JPG, PNG, GIF, etc.)

#### 5. "Upload timed out"

- **Cause:** Network timeout during upload
- **Solution:** Check your internet connection and try again

### Debug Steps

1. **Check Backend Logs:**

   ```bash
   cd backend
   npm run dev
   # Look for Cloudinary-related messages
   ```

2. **Check Environment Variables:**

   ```bash
   cd backend
   node -e "console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME)"
   ```

3. **Test Cloudinary Connection:**
   ```bash
   curl -X GET "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/resources/image" \
     -u "YOUR_API_KEY:YOUR_API_SECRET"
   ```

## 📁 File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── cloudinary.ts          # ✅ Cloudinary configuration
│   ├── routes/
│   │   └── uploadRoutes.ts        # ✅ Upload routes with error handling
│   └── index.ts                   # ✅ Routes registered
├── .env                           # ⚠️ Create this file with Cloudinary credentials
└── package.json                   # ✅ Dependencies installed

frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── ImageUploader.tsx  # ✅ Enhanced upload component
│   │   ├── create-profile/
│   │   │   └── page.tsx           # ✅ Profile creation with image upload
│   │   └── profile/
│   │       └── page.tsx           # ✅ Profile display with image
│   └── config/
│       └── api.ts                 # ✅ API endpoints configuration
└── package.json
```

## 🎯 Features

### Image Processing

- ✅ Automatic image optimization
- ✅ Face detection and cropping (400x400px)
- ✅ Quality optimization
- ✅ Multiple format support (JPG, PNG, GIF, WebP)

### Security

- ✅ Authentication required for uploads
- ✅ File type validation
- ✅ File size limits (5MB)
- ✅ Secure HTTPS URLs

### User Experience

- ✅ Real-time upload progress
- ✅ Clear error messages
- ✅ Image preview
- ✅ Easy image replacement
- ✅ Graceful error handling

## 🚀 Production Deployment

### Environment Variables for Production

Set these in your production environment (Render, Vercel, etc.):

```env
CLOUDINARY_CLOUD_NAME=your-production-cloud-name
CLOUDINARY_API_KEY=your-production-api-key
CLOUDINARY_API_SECRET=your-production-api-secret
```

### Cloudinary Settings

1. **Upload Presets:** Create upload presets for different image types
2. **Transformations:** Set up automatic transformations for different use cases
3. **Security:** Enable signed uploads for production
4. **CDN:** Cloudinary automatically provides global CDN

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure both backend and frontend are running
4. Check the browser console and backend logs for errors
5. Test the API endpoints directly with curl

## 🎉 Success!

Once everything is set up correctly, you should be able to:

- ✅ Upload profile images during registration
- ✅ Edit profile images in the profile page
- ✅ See images displayed correctly throughout the app
- ✅ Delete images when needed
- ✅ Handle errors gracefully

The image upload system is now fully functional and ready for production use! 🚀
