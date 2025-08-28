# Railway Backend Deployment Guide

## 1. Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Authorize Railway to access your repositories

## 2. Deploy Backend
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your `wedding-planner` repository
4. Set the source directory to `server`
5. Railway will automatically detect it's a Node.js app

## 3. Set Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/wedding-planner?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
PORT=5000
NODE_ENV=production
```

**Important Notes:**
- Replace `username:password` with your MongoDB Atlas credentials
- Generate a strong JWT_SECRET (you can use a password generator)
- The PORT will be automatically set by Railway

## 4. Deploy
1. Railway will automatically start the deployment
2. Wait for the build to complete
3. Check the logs for any errors

## 5. Get Your Backend URL
After successful deployment, Railway will provide a URL like:
```
https://your-app-name.railway.app
```

## 6. Test Backend
Visit your Railway URL to test:
```
https://your-app-name.railway.app
```

You should see a message indicating the server is running.

## 7. Troubleshooting
If deployment fails:
1. Check the build logs in Railway dashboard
2. Ensure all environment variables are set correctly
3. Verify your MongoDB connection string
4. Check that the `server` directory contains all necessary files

## 8. Update CORS (if needed)
If you get CORS errors later, you may need to update your server's CORS settings to allow your Netlify domain.
