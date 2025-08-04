# Render Deployment Guide

## Quick Setup

1. **Connect Repository**: Connect your GitHub repository to Render
2. **Create Web Service**: Choose "Web Service" 
3. **Configure Settings**:

### Build & Start Commands
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Environment Variables
Set these in Render dashboard:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://osohbayar:U4c8befcf18ca@mentormeet.xfipt6t.mongodb.net/e-sport-connection
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-key-change-this-in-production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## Important Notes

### 1. Build Process
- Render will run `npm install` first
- Then `npm run build` to compile TypeScript
- Finally `npm start` to run the compiled JavaScript

### 2. Port Configuration
- Render automatically sets `PORT` environment variable
- Your app uses `process.env.PORT || 5001`

### 3. Database Connection
- MongoDB Atlas connection is configured
- Database will be created automatically on first run

### 4. Auto-Deploy
- Render will automatically deploy on every push to your main branch
- You can also manually trigger deployments

## Troubleshooting

### If you see TypeScript errors:
1. Make sure `render.yaml` is in your repository
2. Check that `npm run build` works locally
3. Verify all dependencies are in `package.json`

### If MongoDB connection fails:
1. Check your MongoDB Atlas network access settings
2. Verify the connection string is correct
3. Ensure the database user has proper permissions

## Success Indicators
- ✅ Build completes without errors
- ✅ "MongoDB connected successfully" in logs
- ✅ Server starts on Render's assigned port
- ✅ Health check endpoint responds 