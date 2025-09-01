#!/bin/bash

echo "Starting build process..."
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

echo "Building server..."
cd Wedding-planner/server
npm install
npm run build:clean
echo "Server build complete. Checking dist:"
ls -la dist/

echo "Building client..."
cd ../client
npm install
npm run build
echo "Client build complete!"

echo "All builds completed successfully!"
