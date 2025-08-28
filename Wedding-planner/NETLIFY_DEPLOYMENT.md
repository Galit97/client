# Netlify Frontend Deployment Guide

## 1. Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with your GitHub account
3. Authorize Netlify to access your repositories

## 2. Deploy Frontend
1. Click "New site from Git"
2. Choose "GitHub"
3. Select your `wedding-planner` repository
4. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

## 3. Set Environment Variables
In Netlify dashboard, go to Site settings → Environment variables and add:

```
VITE_API_URL=https://your-railway-app-name.railway.app
```

**Important:** Replace `your-railway-app-name` with your actual Railway app name.

## 4. Deploy
1. Click "Deploy site"
2. Netlify will automatically build and deploy your site
3. Wait for the build to complete

## 5. Get Your Netlify URL
After successful deployment, Netlify will provide a URL like:
```
https://your-site-name.netlify.app
```

## 6. Custom Domain (Optional)
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure your domain

## 7. Test Your Deployment
1. Visit your Netlify URL
2. Test the application functionality
3. Check the browser console for any errors

## 8. Troubleshooting
If deployment fails:
1. Check the build logs in Netlify dashboard
2. Ensure the `VITE_API_URL` environment variable is set correctly
3. Verify that your Railway backend is running
4. Check that all dependencies are properly installed

## 9. Continuous Deployment
Netlify will automatically redeploy when you push changes to your GitHub repository.

## 10. Environment Variables for Different Branches
You can set different environment variables for different branches:
1. Go to Site settings → Environment variables
2. Click "Add variable"
3. Select the branch you want to configure
4. Set the appropriate values
