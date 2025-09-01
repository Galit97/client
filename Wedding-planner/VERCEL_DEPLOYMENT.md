# Vercel Deployment Guide for Wedding Planner Frontend

## Prerequisites
- Vercel account (sign up at [vercel.com](https://vercel.com))
- GitHub repository with your code
- Backend deployed on Render

## Deployment Steps

### 1. Connect Your Repository
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `wedding-planner`
4. Select the repository

### 2. Configure the Project
- **Framework Preset**: `Vite`
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables
Set these environment variables in Vercel:

```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

**Important**: Replace `your-render-backend-url.onrender.com` with your actual Render backend URL.

### 4. Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at `https://your-project-name.vercel.app`

### 5. Custom Domain (Optional)
1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Configuration Details

### Build Settings
- **Framework**: Vite (automatically detected)
- **Node.js Version**: 18.x or higher
- **Build Output**: The `dist` folder from the client build

### Environment Variables
The `VITE_API_URL` environment variable tells your frontend where to find the backend API. This should point to your Render backend service.

## Troubleshooting

### Build Failures
- Check that all dependencies are properly installed
- Verify the client directory structure
- Check Vercel build logs for specific errors

### API Connection Issues
- Verify `VITE_API_URL` is set correctly
- Check that your Render backend is running
- Ensure CORS is properly configured on the backend

### Runtime Errors
- Check browser console for JavaScript errors
- Verify environment variables are accessible
- Test API endpoints directly

## Next Steps
After successful deployment:
1. Test all frontend functionality
2. Verify API calls to your Render backend
3. Test user authentication and data persistence
4. Monitor performance and error logs

## Updating Your App
- Push changes to your GitHub repository
- Vercel will automatically redeploy
- Environment variables persist between deployments
- You can manually trigger redeploys from the Vercel dashboard
