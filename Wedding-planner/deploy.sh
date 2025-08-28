#!/bin/bash

echo "🚀 Wedding Planner Deployment Script"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Wedding-planner directory"
    exit 1
fi

echo "📋 Prerequisites Check:"
echo "1. MongoDB Atlas database set up"
echo "2. Railway account created"
echo "3. Netlify account created"
echo "4. GitHub repository pushed"
echo ""

read -p "Have you completed all prerequisites? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the prerequisites first:"
    echo "- Read MONGODB_SETUP.md"
    echo "- Read RAILWAY_DEPLOYMENT.md"
    echo "- Read NETLIFY_DEPLOYMENT.md"
    exit 1
fi

echo ""
echo "🔧 Building the project..."

# Install dependencies
echo "Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi

echo "Building client..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build client"
    exit 1
fi

cd ..

echo "Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi

cd ..

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📝 Next Steps:"
echo "1. Deploy backend to Railway:"
echo "   - Follow RAILWAY_DEPLOYMENT.md"
echo "   - Get your Railway URL"
echo ""
echo "2. Deploy frontend to Netlify:"
echo "   - Follow NETLIFY_DEPLOYMENT.md"
echo "   - Set VITE_API_URL to your Railway URL"
echo ""
echo "3. Test your deployment:"
echo "   - Visit your Netlify URL"
echo "   - Test all functionality"
echo ""
echo "🎉 Your wedding planner will be live!"
