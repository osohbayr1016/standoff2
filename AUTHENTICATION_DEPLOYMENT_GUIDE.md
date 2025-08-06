# 🔐 Authentication System Deployment Guide

This guide will help you deploy the E-Sport Connection authentication system with full functionality.

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Google OAuth app (optional)
- Facebook OAuth app (optional)
- Deployment platform accounts (Vercel, Railway, etc.)

## 🚀 Backend Deployment

### 1. Environment Setup

1. **Copy environment file:**

   ```bash
   cd backend
   cp env.example .env
   ```

2. **Configure environment variables:**

   ```env
   # Production settings
   NODE_ENV=production
   PORT=5000

   # Database (use MongoDB Atlas for production)
   MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/e-sport-connection"

   # Frontend URL (update with your production URL)
   FRONTEND_URL=https://your-frontend-domain.com

   # Security (generate strong secrets)
   JWT_SECRET=your-very-long-and-random-jwt-secret-key-here
   SESSION_SECRET=your-very-long-and-random-session-secret-key-here

   # OAuth (optional - configure if using social login)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret
   ```

### 2. Database Setup

1. **MongoDB Atlas (Recommended):**

   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create new cluster
   - Get connection string
   - Update `MONGODB_URI` in `.env`

2. **Local MongoDB:**
   ```bash
   # Install MongoDB locally
   # Update MONGODB_URI to: mongodb://localhost:27017/e-sport-connection
   ```

### 3. OAuth Setup (Optional)

#### Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5001/api/auth/google/callback` (development)
   - `https://your-backend-domain.com/api/auth/google/callback` (production)
6. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

#### Facebook OAuth:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs
5. Update `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`

### 4. Deploy Backend

#### Option A: Railway

1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

#### Option B: Render

1. Connect GitHub repository to Render
2. Set environment variables
3. Deploy

#### Option C: Heroku

```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set FRONTEND_URL="https://your-frontend-domain.com"
git push heroku main
```

## 🌐 Frontend Deployment

### 1. Environment Setup

1. **Create environment file:**

   ```bash
   cd frontend
   # Create .env.local for local development
   echo "NEXT_PUBLIC_API_URL=http://localhost:5001" > .env.local

   # For production, set in deployment platform
   ```

2. **Production environment variables:**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```

### 2. Deploy Frontend

#### Option A: Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
3. Deploy automatically

#### Option B: Netlify

1. Connect GitHub repository to Netlify
2. Set environment variables
3. Deploy

## 🔧 Testing the Authentication System

### 1. Test Registration

```bash
# Test with curl
curl -X POST https://your-backend-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "PLAYER"
  }'
```

### 2. Test Login

```bash
curl -X POST https://your-backend-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Protected Routes

```bash
# Get user profile (requires token)
curl -X GET https://your-backend-domain.com/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛡️ Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] Strong session secret
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation working
- [ ] Password hashing working
- [ ] OAuth redirects secure
- [ ] Environment variables not exposed

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors:**

   - Check `FRONTEND_URL` in backend environment
   - Ensure frontend URL is correct

2. **Database Connection:**

   - Verify MongoDB URI
   - Check network access
   - Ensure database exists

3. **JWT Errors:**

   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure token format is correct

4. **OAuth Issues:**
   - Verify redirect URIs match
   - Check client IDs and secrets
   - Ensure OAuth apps are configured

### Debug Commands:

```bash
# Check backend health
curl https://your-backend-domain.com/health

# Check environment variables
echo $NODE_ENV
echo $MONGODB_URI

# View logs
heroku logs --tail  # Heroku
railway logs        # Railway
```

## 📱 Mobile Considerations

For mobile app integration:

1. **Update CORS settings** to include mobile app domains
2. **Configure deep linking** for OAuth callbacks
3. **Test token refresh** on mobile devices
4. **Implement secure storage** for tokens

## 🔄 Maintenance

### Regular Tasks:

- [ ] Monitor authentication logs
- [ ] Update dependencies
- [ ] Rotate JWT secrets periodically
- [ ] Review OAuth app settings
- [ ] Backup user data
- [ ] Monitor rate limiting

### Security Updates:

- [ ] Keep Node.js updated
- [ ] Update authentication libraries
- [ ] Review security headers
- [ ] Monitor for vulnerabilities

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review server logs
3. Verify environment variables
4. Test with curl commands
5. Check network connectivity

## 🎉 Success Indicators

Your authentication system is working when:

- ✅ Users can register successfully
- ✅ Users can login with email/password
- ✅ OAuth login works (if configured)
- ✅ Protected routes require authentication
- ✅ Tokens refresh automatically
- ✅ Logout works properly
- ✅ No CORS errors in browser console
- ✅ All API endpoints return proper responses

---

**Happy Deploying! 🚀**
