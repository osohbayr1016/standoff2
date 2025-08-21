# 🚀 Production Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions for deploying the E-Sport Connection application to production.

## 🏗️ Architecture

- **Frontend**: Next.js 15.4.5 (Vercel)
- **Backend**: Node.js + Express + TypeScript (Render)
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary
- **Authentication**: Google OAuth, Facebook OAuth, JWT

## 🔧 Prerequisites

- [Vercel Account](https://vercel.com)
- [Render Account](https://render.com)
- [MongoDB Atlas Account](https://mongodb.com/atlas)
- [Cloudinary Account](https://cloudinary.com)
- [Google OAuth App](https://console.developers.google.com)
- [Facebook OAuth App](https://developers.facebook.com)

## 🎯 Frontend Deployment (Vercel)

### 1. Environment Variables

Set these environment variables in your Vercel project:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_WS_URL=https://your-backend-url.onrender.com
```

### 2. Deployment Steps

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Configure environment variables
4. Deploy

### 3. Build Configuration

The project is already configured with:

- ✅ Next.js 15.4.5
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Image optimization
- ✅ API routes
- ✅ Environment variables

## 🔧 Backend Deployment (Render)

### 1. Environment Variables

Set these environment variables in your Render service:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/e-sport-connection
JWT_SECRET=your-super-secure-jwt-secret
SESSION_SECRET=your-super-secure-session-secret
FRONTEND_URL=https://your-frontend-url.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password
```

### 2. Deployment Steps

1. Connect your GitHub repository to Render
2. Set the root directory to `backend`
3. Configure environment variables
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Deploy

### 3. Health Check

The backend includes a health check endpoint at `/health` for monitoring.

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create Cluster

1. Create a new MongoDB Atlas cluster
2. Choose the free tier (M0)
3. Select your preferred region

### 2. Database Access

1. Create a database user with read/write permissions
2. Whitelist your IP addresses (or use 0.0.0.0/0 for Render)

### 3. Connection String

Use the connection string format:

```
mongodb+srv://username:password@cluster.mongodb.net/e-sport-connection
```

## ☁️ File Storage (Cloudinary)

### 1. Account Setup

1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Configure environment variables

### 2. Configuration

The application is already configured to use Cloudinary for:

- User avatars
- Clan logos
- Profile images

## 🔐 Authentication Setup

### 1. Google OAuth

1. Go to [Google Cloud Console](https://console.developers.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-backend-url.onrender.com/api/auth/google/callback`
   - `http://localhost:8000/api/auth/google/callback` (for development)

### 2. Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs:
   - `https://your-backend-url.onrender.com/api/auth/facebook/callback`
   - `http://localhost:8000/api/auth/facebook/callback` (for development)

## 📧 Email Configuration

### 1. Gmail Setup

1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in EMAIL_PASS environment variable

### 2. Email Templates

The application includes email templates for:

- Welcome emails
- Password reset
- Clan invitations
- Notifications

## 🔍 Post-Deployment Checklist

### Frontend (Vercel)

- [ ] Environment variables configured
- [ ] Build successful
- [ ] All pages loading correctly
- [ ] Authentication working
- [ ] API calls successful
- [ ] Images loading properly
- [ ] Responsive design working

### Backend (Render)

- [ ] Environment variables configured
- [ ] Build successful
- [ ] Health check endpoint responding
- [ ] Database connection working
- [ ] Authentication endpoints working
- [ ] File upload working
- [ ] WebSocket connection working

### Database (MongoDB Atlas)

- [ ] Cluster running
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Connection string working
- [ ] Collections created automatically

### Authentication

- [ ] Google OAuth working
- [ ] Facebook OAuth working
- [ ] JWT tokens generating
- [ ] Sessions working
- [ ] Logout working

### Features

- [ ] User registration/login
- [ ] Profile creation
- [ ] Clan creation
- [ ] Clan invitations
- [ ] Messaging system
- [ ] File uploads
- [ ] Real-time notifications

## 🚨 Security Considerations

### 1. Environment Variables

- ✅ Never commit secrets to version control
- ✅ Use strong, unique secrets
- ✅ Rotate secrets regularly
- ✅ Use different secrets for each environment

### 2. CORS Configuration

- ✅ Backend configured to allow frontend domain
- ✅ Development URLs included for testing
- ✅ Production URLs properly configured

### 3. Database Security

- ✅ Strong database passwords
- ✅ IP whitelist configured
- ✅ Database user with minimal required permissions

### 4. API Security

- ✅ JWT tokens with expiration
- ✅ Rate limiting (can be added)
- ✅ Input validation
- ✅ Error handling without sensitive data

## 📊 Monitoring & Maintenance

### 1. Health Checks

- Frontend: Vercel provides built-in monitoring
- Backend: `/health` endpoint for uptime monitoring
- Database: MongoDB Atlas provides monitoring

### 2. Logs

- Frontend: Vercel function logs
- Backend: Render service logs
- Database: MongoDB Atlas logs

### 3. Performance

- Frontend: Vercel analytics
- Backend: Render metrics
- Database: MongoDB Atlas performance advisor

## 🔄 Update Process

### 1. Frontend Updates

1. Push changes to GitHub
2. Vercel automatically deploys
3. Verify changes in production

### 2. Backend Updates

1. Push changes to GitHub
2. Render automatically deploys
3. Check health endpoint
4. Verify API functionality

### 3. Database Updates

1. Schema changes are handled automatically by Mongoose
2. Monitor for any migration issues
3. Backup before major changes

## 🆘 Troubleshooting

### Common Issues

#### Frontend Issues

- **Build Failures**: Check TypeScript errors and dependencies
- **API Errors**: Verify environment variables and backend URL
- **Image Issues**: Check Cloudinary configuration

#### Backend Issues

- **Database Connection**: Verify MongoDB URI and network access
- **Authentication**: Check OAuth credentials and redirect URIs
- **File Upload**: Verify Cloudinary configuration

#### Database Issues

- **Connection Timeout**: Check network connectivity and IP whitelist
- **Authentication**: Verify database user credentials
- **Performance**: Monitor query performance and indexes

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com)

## 🎉 Deployment Complete!

Your E-Sport Connection application is now ready for production use!

### Quick Links

- Frontend: `https://your-frontend-url.vercel.app`
- Backend: `https://your-backend-url.onrender.com`
- Health Check: `https://your-backend-url.onrender.com/health`

### Next Steps

1. Test all features thoroughly
2. Set up monitoring and alerts
3. Configure backups
4. Plan for scaling
5. Document any custom configurations

---

**Note**: Keep this guide updated as you make changes to the deployment configuration.
