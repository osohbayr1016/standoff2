# 🚨 CRITICAL: Render Environment Variables Setup

## ⚠️ Missing Environment Variables = Deployment Failure

Based on your code analysis, here are the **REQUIRED** environment variables for Render:

## 🔥 ESSENTIAL Environment Variables (Must Set)

### 1. **Database Configuration** (CRITICAL)

```
MONGODB_URI=mongodb+srv://osohbayar:U4c8befcf18ca@mentormeet.xfipt6t.mongodb.net/e-sport-connection
```

### 2. **Security Configuration** (CRITICAL)

```
JWT_SECRET=<click "Generate" in Render>
SESSION_SECRET=<click "Generate" in Render>
NODE_ENV=production
```

### 3. **CORS Configuration** (CRITICAL)

```
FRONTEND_URL=https://e-sport-connection.vercel.app
```

### 4. **Server Configuration**

```
PORT=<auto-set by Render>
```

## 🛠️ How to Set Environment Variables in Render

### Step 1: Go to Render Dashboard

1. Navigate to: https://dashboard.render.com
2. Select your `e-sport-connection-backend` service
3. Click **"Environment"** tab in the left sidebar

### Step 2: Add Required Variables

Click **"Add Environment Variable"** for each:

```
Key: NODE_ENV
Value: production

Key: MONGODB_URI
Value: mongodb+srv://osohbayar:U4c8befcf18ca@mentormeet.xfipt6t.mongodb.net/e-sport-connection

Key: JWT_SECRET
Value: <click "Generate">

Key: SESSION_SECRET
Value: <click "Generate">

Key: FRONTEND_URL
Value: https://e-sport-connection.vercel.app
```

## 🔧 Optional Environment Variables

### Cloudinary (for file uploads)

```
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
```

### Email Service (for notifications)

```
EMAIL_USER=<your-gmail>
EMAIL_PASS=<your-app-password>
```

### FACEIT Integration (optional)

```
FACEIT_API_KEY=<your-faceit-api-key>
```

### OAuth (optional)

```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
FACEBOOK_APP_ID=<your-facebook-app-id>
FACEBOOK_APP_SECRET=<your-facebook-app-secret>
```

## 🚀 Deploy After Setting Environment Variables

### Step 3: Deploy

After setting the required environment variables:

1. **Manual Deploy**: Click "Deploy latest commit" in Render
2. **Or Auto-Deploy**: Push a commit to trigger deployment

## ✅ Verification

After deployment, test the health endpoint:

```bash
curl https://your-app-name.onrender.com/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "E-Sport Connection API is running",
  "timestamp": "2025-08-19T..."
}
```

## 🚨 Common Issues & Solutions

### Issue: "MongoDB connection failed"

**Solution**: Verify `MONGODB_URI` is set correctly

### Issue: "JWT token verification failed"

**Solution**: Set `JWT_SECRET` environment variable

### Issue: "CORS errors"

**Solution**: Set `FRONTEND_URL` to your Vercel frontend URL

### Issue: "Server not starting"

**Solution**: Check logs for missing environment variables

## 📋 Checklist Before Deployment

- [ ] `NODE_ENV=production` set
- [ ] `MONGODB_URI` set with your MongoDB connection string
- [ ] `JWT_SECRET` generated in Render
- [ ] `SESSION_SECRET` generated in Render
- [ ] `FRONTEND_URL` set to your Vercel app URL
- [ ] Build command: `npm ci && npm run build`
- [ ] Start command: `npm start`

**Without these environment variables, your deployment will fail!** 🚨
