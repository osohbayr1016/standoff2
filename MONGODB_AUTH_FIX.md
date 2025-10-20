# MongoDB Authentication Fix for Render Deployment

## Problem

MongoDB authentication is failing on Render with error: `bad auth : authentication failed`

## Root Causes

1. Incorrect username/password in connection string
2. MongoDB Atlas IP whitelist not configured for Render
3. Database user lacks proper permissions
4. Password contains special characters that need URL encoding

## Solution Steps

### Step 1: Fix MongoDB Atlas Configuration

#### 1.1 Check Database User

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster: `mentormeet`
3. Go to **Database Access** (left sidebar)
4. Verify the user exists and note the **exact username**
5. If user doesn't exist or you're unsure of the password:
   - Click **"Edit"** on existing user or **"Add New Database User"**
   - Username: `osohbayar` (or your preferred username)
   - Create a **NEW password** (write it down!)
   - Select **Built-in Role**: `Atlas admin` or at minimum `Read and write to any database`
   - Click **"Update User"** or **"Add User"**

#### 1.2 Configure Network Access

1. In MongoDB Atlas, go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - This is required for Render deployment
   - Render uses dynamic IPs, so you must allow all IPs
4. Click **"Confirm"**

#### 1.3 Get Correct Connection String

1. In MongoDB Atlas, go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Copy the connection string, it should look like:
   ```
   mongodb+srv://<username>:<password>@mentormeet.xfipt6t.mongodb.net/<database>
   ```
5. Replace:
   - `<username>` with your database username
   - `<password>` with your actual password
   - `<database>` with `e-sport-connection`

#### 1.4 URL Encode Password (if needed)

If your password contains special characters, you must URL encode them:

| Character | URL Encoded |
| --------- | ----------- |
| `@`       | `%40`       |
| `:`       | `%3A`       |
| `/`       | `%2F`       |
| `?`       | `%3F`       |
| `#`       | `%23`       |
| `[`       | `%5B`       |
| `]`       | `%5D`       |
| `!`       | `%21`       |
| `$`       | `%24`       |
| `&`       | `%26`       |
| `'`       | `%27`       |
| `(`       | `%28`       |
| `)`       | `%29`       |
| `*`       | `%2A`       |
| `+`       | `%2B`       |
| `,`       | `%2C`       |
| `;`       | `%3B`       |
| `=`       | `%3D`       |
| `%`       | `%25`       |
| ` `       | `%20`       |

### Step 2: Update Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your `e-sport-connection-backend` service
3. Go to **Environment** tab
4. Update `MONGODB_URI` with the correct connection string:
   ```
   mongodb+srv://<username>:<encoded-password>@mentormeet.xfipt6t.mongodb.net/e-sport-connection?retryWrites=true&w=majority
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy

### Step 3: Verify Connection

1. Check Render logs for:
   ```
   ✅ MongoDB connected successfully
   ```
2. Test the health endpoint:
   ```
   https://your-backend-url.onrender.com/health
   ```

## Quick Fix Checklist

- [ ] MongoDB Atlas user exists with correct username
- [ ] MongoDB Atlas user has proper permissions (Read and write)
- [ ] Network Access allows `0.0.0.0/0` (Allow Access from Anywhere)
- [ ] Password is URL encoded if it contains special characters
- [ ] Connection string format is correct
- [ ] Updated `MONGODB_URI` in Render environment variables
- [ ] Render service redeployed successfully

## Common Issues

### Issue: "AtlasError: bad auth"

- **Solution**: Double-check username and password are correct
- **Solution**: Ensure user exists in Database Access with proper permissions

### Issue: "IP not whitelisted"

- **Solution**: Add `0.0.0.0/0` to Network Access in MongoDB Atlas

### Issue: "Authentication failed"

- **Solution**: Reset the database user password in MongoDB Atlas
- **Solution**: URL encode the password if it has special characters

## Recommended Connection String Format

```
mongodb+srv://<username>:<password>@mentormeet.xfipt6t.mongodb.net/e-sport-connection?retryWrites=true&w=majority&authSource=admin
```

Add `authSource=admin` if authentication issues persist.

## Testing Locally

Before deploying, test the connection string locally:

1. Update your backend `.env` file with the new `MONGODB_URI`
2. Run: `cd backend && npm run dev`
3. Check if MongoDB connects successfully
4. If it works locally, deploy to Render

## Need to Create a New MongoDB Database?

If you want a fresh start:

1. Create a new cluster on MongoDB Atlas (Free tier available)
2. Set up a new database user with a simple password (no special characters)
3. Configure Network Access to allow all IPs (`0.0.0.0/0`)
4. Use the new connection string in Render
