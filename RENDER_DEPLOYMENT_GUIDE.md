# Render Deployment Guide - Manual Configuration

## Step-by-Step Instructions

### 1. Connect Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `osohbayr1016/e-sport-connection`

### 2. Configure Service Settings

**Basic Settings:**

- **Name**: `e-sport-connection-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `sport` (your current branch)

**Build & Deploy Settings:**

- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3. Environment Variables

Add these environment variables in Render dashboard:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://osohbayr1016:U4c8befcf18ca@mentormeet.xfipt6t.mongodb.net/e-sport-connection
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-key-change-this-in-production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 4. Advanced Settings

- **Auto-Deploy**: Enabled
- **Health Check Path**: `/health`

### 5. Deploy

Click "Create Web Service" and wait for deployment.

## Troubleshooting

### If Build Fails:

1. Check the build logs in Render dashboard
2. Verify all dependencies are in `package.json`
3. Make sure TypeScript compilation works locally

### If MongoDB Connection Fails:

1. Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
2. Verify connection string is correct
3. Check database user permissions

### Success Indicators:

- ✅ Build completes without errors
- ✅ "MongoDB connected successfully" in logs
- ✅ Health check endpoint responds
- ✅ Service shows "Live" status

## Important Notes

- **Port**: Render automatically sets `PORT` environment variable
- **Database**: MongoDB Atlas connection is configured
- **Auto-Deploy**: Will deploy on every push to `sport` branch
- **Free Tier**: Service will spin down after inactivity
