# Netlify Frontend Deployment Guide (Fixed)

## ⚠️ Important: Build Directory Fix
Your project has a nested structure where the client is in `Wedding-planner/client/`. Netlify needs to know how to handle this.

## 1. Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with your GitHub account
3. Authorize Netlify to access your repositories

## 2. Deploy Frontend (Updated Process)
1. Click "New site from Git"
2. Choose "GitHub"
3. Select your `wedding-planner` repository
4. **Important**: Deploy from ROOT directory (not client directory)
5. Netlify will use the `netlify.toml` configuration we created

## 3. Netlify Configuration
The `netlify.toml` file in your root directory tells Netlify:
- Base directory: `Wedding-planner/client`
- Build command: `npm run build`
- Publish directory: `dist`

## 4. Build Settings (Automatic)
Netlify will automatically detect these settings from `netlify.toml`:
- **Base directory**: `Wedding-planner/client`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

## 5. Set Environment Variables
In Netlify dashboard, go to Site settings → Environment variables and add:

```
VITE_API_URL=https://your-railway-app-name.railway.app
```

**Important:** Replace `your-railway-app-name` with your actual Railway app name.

## 6. Deploy
1. Click "Deploy site"
2. Netlify will automatically:
   - Navigate to `Wedding-planner/client/`
   - Install dependencies
   - Run the build command
   - Deploy the `dist` folder
3. Wait for the build to complete

## 7. Get Your Netlify URL
After successful deployment, Netlify will provide a URL like:
```
https://your-site-name.netlify.app
```

## 8. Custom Domain (Optional)
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure your domain

## 9. Test Your Deployment
1. Visit your Netlify URL
2. Test the application functionality
3. Check the browser console for any errors

## 10. Troubleshooting

### Build Fails
If the build fails:
1. Check the build logs in Netlify dashboard
2. Ensure the `VITE_API_URL` environment variable is set correctly
3. Verify that your Railway backend is running
4. Check that all dependencies are properly installed

### Common Issues
- **"Deploy directory 'dist' does not exist"**: This means Netlify couldn't find the build output. The `netlify.toml` file fixes this.
- **"Build script returned non-zero exit code"**: Check the build logs for specific errors
- **"Module not found"**: Check that all dependencies are in `Wedding-planner/client/package.json`

## 11. Continuous Deployment
Netlify will automatically redeploy when you push changes to your GitHub repository.

## 12. Environment Variables for Different Branches
You can set different environment variables for different branches:
1. Go to Site settings → Environment variables
2. Click "Add variable"
3. Select the branch you want to configure
4. Set the appropriate values
