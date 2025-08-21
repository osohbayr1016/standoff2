# E-Sport Connection Backend

A Node.js/Express backend API for the E-Sport Connection platform, built with TypeScript and MongoDB.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## 📋 Features

- **Authentication**: JWT-based auth with Google/Facebook OAuth
- **User Management**: Player and organization profiles
- **Team Management**: Create, join, and manage teams
- **Real-time Chat**: WebSocket-based messaging

- **File Upload**: Cloudinary integration for images
- **Notifications**: Real-time notification system
- **Email Service**: Invitation and notification emails

## 🔧 Environment Variables

Create a `.env` file based on `env.example`:

```bash
# Required
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
FRONTEND_URL=http://localhost:3000

# Optional (for enhanced features)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
EMAIL_USER=your-gmail-address
EMAIL_PASS=your-gmail-app-password
```

## 🚀 Production Deployment

### Status: ✅ Production Ready

The backend has been fixed and is ready for production deployment. All deployment issues have been resolved.

### Quick Deployment

1. **Run deployment script:**

```bash
./deploy-production.sh
```

2. **Push to GitHub:**

```bash
git add .
git commit -m "Fix production deployment issues"
git push origin main
```

3. **Deploy to Render:**

- Go to Render Dashboard
- Select your backend service
- Click "Deploy latest commit"

4. **Verify deployment:**

```bash
curl https://your-app.onrender.com/health
curl https://your-app.onrender.com/api/test-cors
```

### Deployment Documentation

- 📖 [Production Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md)
- 📋 [Deployment Fixes Summary](DEPLOYMENT_FIXES_SUMMARY.md)
- 🔧 [Render Deployment Fix](RENDER_DEPLOYMENT_FIX.md)

## 📊 API Endpoints

### Health & Status

- `GET /health` - Health check
- `GET /api/test-cors` - CORS test
- `GET /api/v1` - API version info

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/facebook` - Facebook OAuth

### Users & Profiles

- `GET /api/users` - Get users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `GET /api/player-profiles` - Get player profiles
- `POST /api/player-profiles` - Create player profile

### Teams

- `GET /api/teams` - Get teams
- `POST /api/teams/create` - Create team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `POST /api/teams/:id/invite` - Invite player
- `POST /api/teams/:id/respond` - Respond to invitation

### Real-time Features

- WebSocket connection for chat
- Real-time notifications
- Live team updates

## 🛠️ Development

### Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

### Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Main application file
```

## 🔍 Monitoring

### Health Checks

- Application health: `/health`
- CORS functionality: `/api/test-cors`
- Database connection: Monitored in logs

### Logs

Monitor these in production logs:

- ✅ MongoDB connection successful
- ✅ Server running on port XXXX
- ✅ FACEIT sync service status
- ❌ Any error messages

## 🐛 Troubleshooting

### Common Issues

**Build fails:**

```bash
npm run build 2>&1
# Check for TypeScript errors
```

**Server won't start:**

```bash
# Check if port is in use
lsof -ti:8000 | xargs kill -9
npm start
```

**Database connection fails:**

- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access
- Ensure database exists

**CORS errors:**

- Verify FRONTEND_URL is correct
- Check allowed origins in CORS configuration

## 📞 Support

For deployment issues:

1. Check [Production Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md)
2. Review [Deployment Fixes Summary](DEPLOYMENT_FIXES_SUMMARY.md)
3. Check Render deployment logs
4. Verify environment variables

## 📄 License

This project is part of the E-Sport Connection platform.

---

**Last Updated**: January 2024  
**Status**: ✅ Production Ready  
**Version**: 1.0.0
