# MongoDB Deployment Guide

## Environment Variables Required

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/e-sport-connection

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your-session-secret-key-change-this-in-production

# Frontend URL
FRONTEND_URL=https://your-frontend-url.vercel.app

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Bcrypt Configuration
BCRYPT_ROUNDS=12

# Streaming Configuration
TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-client-secret
YOUTUBE_API_KEY=your-youtube-api-key
RTMP_SERVER_URL=rtmp://your-rtmp-server:1935/live
FRONTEND_DOMAIN=your-frontend-domain.com
```

## MongoDB Setup Options

### 1. MongoDB Atlas (Recommended)

- Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a free cluster
- Get your connection string
- Replace `MONGODB_URI` with your Atlas connection string

### 2. Local MongoDB

- Install MongoDB locally
- Use: `mongodb://localhost:27017/e-sport-connection`

### 3. Railway MongoDB

- Create a new project on Railway
- Add MongoDB service
- Use the provided connection string

## Deployment Platforms

### Render

1. Connect your GitHub repository
2. Set environment variables
3. Build Command: `npm run build`
4. Start Command: `npm start`

### Railway

1. Connect your GitHub repository
2. Add MongoDB service
3. Set environment variables
4. Deploy automatically

### Heroku

1. Create a new app
2. Add MongoDB addon
3. Set environment variables
4. Deploy from GitHub

## Database Migration

The database will be created automatically when you first run the application. No manual migration is required with MongoDB/Mongoose.

## Security Notes

- Change all secret keys in production
- Use strong passwords for MongoDB
- Enable MongoDB Atlas network access controls
- Use environment variables for all sensitive data
