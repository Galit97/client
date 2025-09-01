# Render Deployment Guide for Wedding Planner Backend

## Prerequisites
- Render account (sign up at [render.com](https://render.com))
- MongoDB Atlas database set up
- GitHub repository with your code

## Deployment Steps

### 1. Connect Your Repository
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Select the repository: `wedding-planner`

### 2. Configure the Service
- **Name**: `wedding-planner-server` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)

### 3. Build & Deploy Settings
- **Build Command**: `npm install && npm run build:server`
- **Start Command**: `cd server && npm start`
- **Root Directory**: Leave empty (deploy from root)

### 4. Environment Variables
Set these environment variables in Render:

```
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 5. Deploy
1. Click "Create Web Service"
2. Wait for the build to complete
3. Note your Render URL (e.g., `https://your-app-name.onrender.com`)

### 6. Update Frontend Configuration
In your Vercel deployment, set the environment variable:
```
VITE_API_URL=https://your-render-url.onrender.com
```

## Troubleshooting

### Build Failures
- Ensure all dependencies are in `package.json`
- Check that TypeScript compilation works locally
- Verify the server directory structure

### Runtime Errors
- Check Render logs for error details
- Verify environment variables are set correctly
- Ensure MongoDB connection string is valid

### CORS Issues
- Verify your Vercel frontend URL is in the CORS configuration
- Check that `NODE_ENV` is set to `production`

## Next Steps
After successful deployment:
1. Test your API endpoints
2. Deploy your frontend to Vercel
3. Update the frontend's `VITE_API_URL` environment variable
4. Test the full application
