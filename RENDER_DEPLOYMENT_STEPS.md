# 🚀 Render Backend Deployment - Step by Step

## Step 1: Go to Render Dashboard

1. Visit [render.com](https://render.com)
2. Sign in to your account
3. Click "New +" button
4. Select "Web Service"

## Step 2: Connect GitHub Repository

1. Click "Connect a repository"
2. Select your `e-sport-connection` repository
3. Authorize Render to access your GitHub account

## Step 3: Configure the Service

1. **Name:** `e-sport-connection-backend`
2. **Root Directory:** `backend` (important!)
3. **Environment:** `Node`
4. **Region:** Choose closest to your users
5. **Branch:** `sport` (or your main branch)

## Step 4: Build & Start Commands

1. **Build Command:** `npm install && npm run build`
2. **Start Command:** `npm start`

## Step 5: Environment Variables

Add these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://osohbayar:U4c8befcf18ca@mentormeet.xfipt6t.mongodb.net/e-sport-connection
JWT_SECRET=your-super-secure-jwt-secret-key-here
SESSION_SECRET=your-super-secure-session-secret-key-here
FRONTEND_URL=https://e-sport-connection.vercel.app
CLOUDINARY_CLOUD_NAME=djvjsyzgw
CLOUDINARY_API_KEY=396391753612689
CLOUDINARY_API_SECRET=l6JGNuzvd28lEJXTlObDzHDtMIc
```

**Important:** Generate secure random strings for JWT_SECRET and SESSION_SECRET!

## Step 6: Deploy

1. Click "Create Web Service"
2. Wait for the build to complete (usually 2-3 minutes)
3. Check the logs for any errors

## Step 7: Test the Deployment

Once deployed, test your backend:

```bash
curl https://your-app-name.onrender.com/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "E-Sport Connection API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Step 8: Get Your Backend URL

- Copy the URL from your Render dashboard
- It will look like: `https://e-sport-connection-backend-xxxx.onrender.com`
- Save this URL for the frontend deployment

## Troubleshooting

### Build Fails

- Check that you selected the `backend` directory
- Verify all environment variables are set
- Check the build logs for TypeScript errors

### Service Won't Start

- Check the start command is `npm start`
- Verify the main file is `dist/index.js`
- Check environment variables are correct

### Health Check Fails

- Check MongoDB connection
- Verify JWT_SECRET is set
- Check CORS configuration

## Next Steps

After successful backend deployment:

1. Copy your backend URL
2. Proceed to frontend deployment on Vercel
3. Use the backend URL in frontend environment variables
