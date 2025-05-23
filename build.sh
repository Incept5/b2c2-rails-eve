#!/bin/bash

# Build frontend
echo "🔨 Building frontend..."
cd frontend || { echo "❌ Failed to change to frontend directory"; exit 1; }
pnpm install --silent || { echo "❌ Frontend dependency installation failed"; exit 1; }
echo "🔧 Approving frontend native dependency builds..."
echo -e "a\ny" | pnpm approve-builds >/dev/null 2>&1 || true
pnpm run build || { echo "❌ Frontend build failed"; exit 1; }
cd .. || { echo "❌ Failed to change to root directory"; exit 1; }
echo "✅ Frontend build completed successfully"

# Build backend
echo "🔨 Building backend..."
cd backend || { echo "❌ Failed to change to backend directory"; exit 1; }
pnpm install --silent || { echo "❌ Backend dependency installation failed"; exit 1; }
echo "🔧 Approving backend native dependency builds..."
echo -e "a\ny" | pnpm approve-builds >/dev/null 2>&1 || true
pnpm run build || { echo "❌ Backend build failed"; exit 1; }
cd .. || { echo "❌ Failed to change to root directory"; exit 1; }
echo "✅ Backend build completed successfully"

echo "✨ Build process completed successfully"
