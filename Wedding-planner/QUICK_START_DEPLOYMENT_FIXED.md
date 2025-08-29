# 🚀 Quick Start Deployment Guide (Fixed)

## Overview
Deploy your Wedding Planner app to production in 3 steps:
1. **MongoDB Atlas** - Database
2. **Railway** - Backend API (Fixed deployment)
3. **Netlify** - Frontend

## Step 1: MongoDB Atlas (5 minutes)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account and cluster
3. Create database user with read/write permissions
4. Allow access from anywhere (0.0.0.0/0)
5. Get your connection string
6. **Save this connection string** - you'll need it for Railway

## Step 2: Deploy Backend to Railway (10 minutes) - FIXED
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → Deploy from GitHub
4. Select your `wedding-planner` repo
5. **Important**: Deploy from ROOT directory (not server directory)
6. Railway will use the `railway.json` configuration file
7. Add environment variables:
   ```
   MONGO_URI=your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=production
   ```
8. Wait for deployment
9. **Copy your Railway URL** (e.g., `https://your-app.railway.app`)

## Step 3: Deploy Frontend to Netlify (10 minutes)
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. New site from Git → GitHub
4. Select your `wedding-planner` repo
5. Configure build settings:
   - Base directory: `Wedding-planner/client`
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variable:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```
7. Deploy site
8. **Copy your Netlify URL** (e.g., `https://your-site.netlify.app`)

## Step 4: Update CORS (2 minutes)
1. Go back to Railway dashboard
2. Add environment variable:
   ```
   ALLOWED_ORIGINS=https://your-site.netlify.app
   ```
3. Redeploy your Railway app

## Step 5: Test Your App
1. Visit your Netlify URL
2. Test registration/login
3. Test creating a wedding
4. Test all features

## 🎉 You're Live!
Your wedding planner is now deployed and accessible worldwide!

## 🔧 What Was Fixed
- **Railway Configuration**: Added `railway.json` in root directory
- **Build Commands**: Properly configured to navigate to `Wedding-planner/server/`
- **Directory Structure**: Railway now understands your nested project structure

## Troubleshooting
- **"Nixpacks was unable to generate a build plan"**: This is now fixed with the `railway.json` file
- **Build fails**: Check the build logs in Railway dashboard
- **CORS errors**: Update the CORS origins in Railway
- **Database connection**: Verify your MongoDB connection string
- **API errors**: Check Railway logs for backend issues

## Cost
- **MongoDB Atlas**: Free (512MB)
- **Railway**: Free tier (limited usage)
- **Netlify**: Free (100GB bandwidth)

## Support
If you encounter issues:
1. Check the detailed guides in this folder
2. Review the deployment logs
3. Test locally first
4. Check browser console for errors
