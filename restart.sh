#!/bin/bash

# Source the stop script to reuse its functions
source ./stop.sh

# Change to backend directory
cd backend || { echo "❌ Failed to change to backend directory"; exit 1; }
echo "📂 Changed to backend directory"

# Stop any running backend process using the stop script's functions
if stop_backend_gracefully; then
    echo "✅ Backend stopped gracefully"
elif force_stop_backend; then
    echo "✅ Backend force stopped"
else
    echo "❌ Failed to stop backend"
    exit 1
fi

# Start the backend
echo "🚀 Starting backend..."
pnpm run start &
sleep 5

# Check if backend started successfully
if check_backend; then
    echo "✅ Backend started successfully"
else
    echo "❌ Failed to start backend"
    exit 1
fi

echo "✨ Restart process completed successfully"