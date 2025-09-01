#!/bin/bash

echo "=== Build Verification ==="
echo "Current directory: $(pwd)"

echo "Checking if server dist exists:"
if [ -d "server/dist" ]; then
    echo "✅ server/dist directory exists"
    echo "Server dist contents:"
    ls -la server/dist/
    
    if [ -f "server/dist/server.js" ]; then
        echo "✅ server/dist/server.js exists"
    else
        echo "❌ server/dist/server.js does not exist"
        exit 1
    fi
else
    echo "❌ server/dist directory does not exist"
    exit 1
fi

echo "Checking if client dist exists:"
if [ -d "client/dist" ]; then
    echo "✅ client/dist directory exists"
    echo "Client dist contents:"
    ls -la client/dist/
else
    echo "❌ client/dist directory does not exist"
    exit 1
fi

echo "=== Build verification completed successfully ==="
