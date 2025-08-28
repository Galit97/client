# MongoDB Atlas Setup Guide

## 1. Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Click "Try Free" and sign up for a free account
3. Choose the "Free" tier (M0)

## 2. Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to your users
5. Click "Create"

## 3. Set Up Database Access
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Select "Read and write to any database"
6. Click "Add User"

## 4. Set Up Network Access
1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add specific IP addresses or ranges
5. Click "Confirm"

## 5. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" as your driver
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `wedding-planner`

Your connection string should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/wedding-planner?retryWrites=true&w=majority
```

## 6. Test Connection
You can test the connection by running your server locally with the connection string as an environment variable:

```bash
cd Wedding-planner/server
MONGO_URI="your-connection-string" npm run dev
```

You should see "✅ MongoDB connected" in the console.
