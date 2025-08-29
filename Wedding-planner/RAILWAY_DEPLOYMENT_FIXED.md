# Railway Backend Deployment Guide (Fixed)

## ⚠️ Important: Directory Structure Fix
Your project has a nested structure where the server is in `Wedding-planner/server/`. Railway needs to know how to handle this.

## 1. Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Authorize Railway to access your repositories

## 2. Deploy Backend (Updated Process)
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your `wedding-planner` repository
4. **Important**: Do NOT set a source directory - deploy from the root
5. Railway will use the `railway.json` configuration we created

## 3. Railway Configuration
The `railway.json` file in your root directory tells Railway:
- How to build the project
- Where to find the server code
- How to start the application

## 4. Set Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/wedding-planner?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NODE_ENV=production
```

**Important Notes:**
- Replace `username:password` with your MongoDB Atlas credentials
- Generate a strong JWT_SECRET (you can use a password generator)
- The PORT will be automatically set by Railway

## 5. Deploy
1. Railway will automatically start the deployment
2. The build process will:
   - Navigate to `Wedding-planner/server/`
   - Install dependencies
   - Build the TypeScript code
   - Start the server
3. Wait for the build to complete
4. Check the logs for any errors

## 6. Get Your Backend URL
After successful deployment, Railway will provide a URL like:
```
https://your-app-name.railway.app
```

## 7. Test Backend
Visit your Railway URL to test:
```
https://your-app-name.railway.app
```

You should see "Server is running" message.

## 8. Troubleshooting

### Build Fails
If the build fails:
1. Check the build logs in Railway dashboard
2. Ensure all environment variables are set correctly
3. Verify your MongoDB connection string
4. Check that the `Wedding-planner/server/` directory contains all necessary files

### Common Issues
- **"Nixpacks was unable to generate a build plan"**: This means Railway couldn't find the right files. The `railway.json` file fixes this.
- **"Module not found"**: Check that all dependencies are in `Wedding-planner/server/package.json`
- **"Port already in use"**: Railway will automatically assign a port

## 9. Update CORS (if needed)
If you get CORS errors later, you may need to update your server's CORS settings to allow your Netlify domain.

## 10. Redeployment
After making changes:
1. Push your changes to GitHub
2. Railway will automatically redeploy
3. Check the logs to ensure successful deployment
