# 🚀 Vercel Frontend Deployment - Step by Step

## Prerequisites

- ✅ Backend deployed on Render
- ✅ Backend URL ready (e.g., `https://e-sport-connection-backend-xxxx.onrender.com`)

## Step 1: Go to Vercel Dashboard

1. Visit [vercel.com](https://vercel.com)
2. Sign in to your account
3. Click "New Project"

## Step 2: Import GitHub Repository

1. Click "Import Git Repository"
2. Select your `e-sport-connection` repository
3. Authorize Vercel to access your GitHub account

## Step 3: Configure the Project

1. **Project Name:** `e-sport-connection` (or your preferred name)
2. **Framework Preset:** `Next.js` (should auto-detect)
3. **Root Directory:** `frontend` (important!)
4. **Build Command:** `npm run build` (auto-detected)
5. **Output Directory:** `.next` (auto-detected)
6. **Install Command:** `npm install` (auto-detected)

## Step 4: Environment Variables

Add these environment variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_WS_URL=https://your-backend-url.onrender.com
```

**Important:** Replace `your-backend-url.onrender.com` with your actual Render backend URL!

## Step 5: Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 1-2 minutes)
3. Check the build logs for any errors

## Step 6: Test the Deployment

Once deployed, test your frontend:

1. **Visit your Vercel URL** (e.g., `https://e-sport-connection.vercel.app`)
2. **Test Registration:**
   - Click "Register"
   - Fill in the form
   - Submit and check if it works
3. **Test Login:**
   - Click "Login"
   - Use the credentials you just created
   - Check if login works
4. **Test Profile Creation:**
   - After login, try to create a profile
   - Check if it saves successfully

## Step 7: Verify API Connection

Open browser developer tools (F12) and check:

1. **Network Tab:** Look for API calls to your backend
2. **Console Tab:** Check for any errors
3. **Application Tab:** Check if JWT tokens are stored

## Step 8: Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain if you have one

## Troubleshooting

### Build Fails

- Check that you selected the `frontend` directory
- Verify all environment variables are set
- Check the build logs for Next.js errors

### Frontend Can't Connect to Backend

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check that your backend is running on Render
- Test backend health check manually

### CORS Errors

- Check browser console for CORS errors
- Verify `FRONTEND_URL` is set correctly in backend
- Make sure frontend URL matches exactly

### Authentication Issues

- Check if JWT tokens are being stored
- Verify backend authentication endpoints work
- Check network requests in browser dev tools

## Testing Checklist

After deployment, test these features:

- [ ] **Homepage loads** without errors
- [ ] **User registration** works
- [ ] **User login** works
- [ ] **Profile creation** works
- [ ] **File upload** works (if implemented)
- [ ] **User browsing** works
- [ ] **No console errors** in browser
- [ ] **API calls** are successful

## Common Issues & Solutions

### "API URL not found" errors

- Check environment variables are set correctly
- Verify backend URL is accessible
- Check for typos in the URL

### "Build failed" errors

- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript compilation errors

### "CORS policy" errors

- Verify backend CORS configuration
- Check frontend URL in backend environment
- Ensure both URLs use HTTPS

## Success Indicators

Your deployment is successful when:

- ✅ Frontend loads without errors
- ✅ Users can register and login
- ✅ API calls work properly
- ✅ No console errors
- ✅ All features function correctly

## Next Steps

After successful frontend deployment:

1. Test all user flows
2. Share the URL with users
3. Monitor for any issues
4. Set up monitoring if needed

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables
4. Test backend endpoints manually
