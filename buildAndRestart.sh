#!/bin/bash

# Change to backend directory
cd backend || { echo "❌ Failed to change to backend directory"; exit 1; }
echo "📂 Changed to backend directory"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --force || { echo "❌ Failed to install dependencies"; exit 1; }
echo "✅ Dependencies installed successfully"

# Build the project
echo "🔨 Building project..."
pnpm run build || { echo "❌ Build failed"; exit 1; }
echo "✅ Build completed successfully"

# Change back to root directory and restart the server
cd .. || { echo "❌ Failed to change to root directory"; exit 1; }
./restart.sh

echo "✨ Build and restart process completed successfully"