#!/bin/bash

# First run the build script
./build.sh || { echo "❌ Build failed"; exit 1; }

# Change to backend directory
cd backend || { echo "❌ Failed to change to backend directory"; exit 1; }
echo "📂 Changed to backend directory"

# Start the application
echo "🚀 Starting the application..."
pnpm run start || { echo "❌ Failed to start the application"; exit 1; }