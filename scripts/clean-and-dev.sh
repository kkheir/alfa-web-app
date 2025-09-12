#!/bin/bash

echo "🧹 Cleaning Next.js cache and restarting development server..."

# Kill any running Next.js processes
echo "Stopping existing development servers..."
pkill -f "next dev" || taskkill /F /IM node.exe 2>nul || true

# Wait a moment for processes to stop
sleep 2

# Try to remove .next directory (may fail due to permissions on Windows)
echo "Clearing .next cache..."
rm -rf .next 2>/dev/null || echo "Some cache files couldn't be removed (permission issues)"

# Clear node modules cache
echo "Clearing node modules cache..."
rm -rf node_modules/.cache 2>/dev/null || echo "Node modules cache cleared"

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

echo "✅ Cache cleanup completed!"
echo "🚀 Starting development server on port 3003..."

# Start development server on port 3003
npm run dev -- -p 3003
