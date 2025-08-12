# E-Sport Connection - Final Deployment Setup

## Backend Deployment (Render)

### 1. Environment Variables for Render Backend

Set these environment variables in your Render dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://osohbayar:U4c8befcf18ca@mentormeet.xfipt6t.mongodb.net/e-sport-connection
JWT_SECRET=[Generate a secure random string]
SESSION_SECRET=[Generate a secure random string]
FRONTEND_URL=https://e-sport-connection.vercel.app
GOOGLE_CLIENT_ID=[Your Google OAuth Client ID - optional]
GOOGLE_CLIENT_SECRET=[Your Google OAuth Client Secret - optional]
FACEBOOK_APP_ID=[Your Facebook App ID - optional]
FACEBOOK_APP_SECRET=[Your Facebook App Secret - optional]
CLOUDINARY_CLOUD_NAME=djvjsyzgw
CLOUDINARY_API_KEY=396391753612689
CLOUDINARY_API_SECRET=l6JGNuzvd28lEJXTlObDzHDtMIc
```

### 2. Render Deployment Steps

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Select the `backend` directory
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add all environment variables listed above
7. Deploy

### 3. Backend Health Check

After deployment, test the backend:

```
https://your-render-app.onrender.com/health
```

## Frontend Deployment (Vercel)

### 1. Environment Variables for Vercel Frontend

Set these environment variables in your Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com
NEXT_PUBLIC_WS_URL=https://your-render-app.onrender.com
```

### 2. Vercel Deployment Steps

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Add environment variables listed above
4. Deploy

## Authentication Flow

### Local Registration/Login

- Users can register with email/password
- Users can login with email/password
- JWT tokens are used for authentication

### OAuth (Currently Disabled)

- Google OAuth is commented out in passport config
- Facebook OAuth is commented out in passport config
- Can be enabled by uncommenting and adding proper credentials

## Database

- MongoDB Atlas is used
- Connection string is configured in environment variables
- User profiles and messages are stored

## File Upload

- Cloudinary is used for image uploads
- Configuration is in environment variables
- Supports profile pictures and other images

## Security Features

- CORS is properly configured for production
- JWT tokens for authentication
- Password hashing with bcrypt
- Helmet for security headers
- Rate limiting (can be added if needed)

## Testing the Deployment

1. **Backend Health Check:**

   ```
   GET https://your-render-app.onrender.com/health
   ```

2. **Frontend Connection:**

   - Visit your Vercel app
   - Try to register/login
   - Check if API calls work

3. **Database Connection:**
   - Backend logs should show "MongoDB connected successfully"
   - Try creating a user account

## Troubleshooting

### Backend Issues

1. Check Render logs for build errors
2. Verify all environment variables are set
3. Check MongoDB connection
4. Verify TypeScript compilation

### Frontend Issues

1. Check Vercel logs
2. Verify environment variables are set
3. Check browser console for API errors
4. Verify CORS configuration

### Common Issues

1. **CORS errors:** Check FRONTEND_URL in backend environment
2. **Database connection:** Verify MONGODB_URI
3. **Build failures:** Check TypeScript compilation
4. **Authentication:** Verify JWT_SECRET is set

## Final Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Authentication working
- [ ] File upload working
- [ ] CORS configured properly
- [ ] Health check endpoint responding

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users

- `GET /api/users/players` - Get all players
- `GET /api/users/:id` - Get user by ID

### Profiles

- `GET /api/player-profiles/profiles` - Get all player profiles
- `POST /api/player-profiles/create-profile` - Create player profile
- `GET /api/organization-profiles/profiles` - Get all organization profiles
- `POST /api/organization-profiles/create-profile` - Create organization profile

### Upload

- `POST /api/upload/image` - Upload image to Cloudinary

### Messages

- `GET /api/messages/:playerId` - Get messages with player
- `POST /api/messages` - Send message

### Health

- `GET /health` - Health check endpoint
