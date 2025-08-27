# Wedding Planner - Deployment Guide

## Overview
This guide will help you deploy your Wedding Planner app to production using:
- **Frontend**: Netlify
- **Backend**: Railway
- **Database**: MongoDB Atlas

## Step 1: Set up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier)

### 1.2 Configure Database
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `wedding-planner`

### 1.3 Get Connection String
Your connection string should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/wedding-planner?retryWrites=true&w=majority
```

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### 2.2 Deploy Backend
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your `wedding-planner` repository
4. Set the source directory to `server`
5. Railway will automatically detect it's a Node.js app

### 2.3 Set Environment Variables
In Railway dashboard, add these variables:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/wedding-planner?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
```

### 2.4 Get Backend URL
After deployment, Railway will give you a URL like:
```
https://your-app-name.railway.app
```

## Step 3: Deploy Frontend to Netlify

### 3.1 Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub

### 3.2 Deploy Frontend
1. Click "New site from Git"
2. Choose GitHub
3. Select your `wedding-planner` repository
4. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: `client`

### 3.3 Set Environment Variables
In Netlify dashboard, go to Site settings > Environment variables:
```
VITE_API_URL=https://your-app-name.railway.app
```

## Step 4: Test Your Deployment

### 4.1 Test Backend
Visit your Railway URL to test the backend:
```
https://your-app-name.railway.app
```
You should see a message indicating the server is running.

### 4.2 Test Frontend
Visit your Netlify URL to test the frontend:
```
https://your-site-name.netlify.app
```

## Step 5: Update CORS (if needed)

If you get CORS errors, update your backend CORS settings in `server.ts`:

```typescript
app.use(cors({
  origin: ['https://your-site-name.netlify.app', 'http://localhost:5173'],
  credentials: true
}));
```

## Troubleshooting

### Common Issues:

1. **Backend not connecting to database**
   - Check your MongoDB Atlas connection string
   - Ensure your IP is whitelisted in Atlas

2. **Frontend can't reach backend**
   - Verify the `VITE_API_URL` environment variable
   - Check CORS settings

3. **Build failures**
   - Check the build logs in Netlify
   - Ensure all dependencies are installed

### Useful Commands:

```bash
# Test backend locally
cd server
npm install
npm start

# Test frontend locally
cd client
npm install
npm run dev
```

## Cost Estimation

- **MongoDB Atlas**: Free tier (512MB)
- **Railway**: Free tier (limited usage)
- **Netlify**: Free tier (100GB bandwidth)

## Security Notes

1. **Never commit sensitive data** like API keys
2. **Use strong JWT secrets**
3. **Enable MongoDB Atlas security features**
4. **Set up proper CORS policies**

## Support

If you encounter issues:
1. Check the deployment logs
2. Verify environment variables
3. Test locally first
4. Check the browser console for errors 