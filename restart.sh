#!/bin/bash

# Source the stop script to reuse its functions
source ./stop.sh

# Change to backend directory
cd backend || { echo "❌ Failed to change to backend directory"; exit 1; }
echo "📂 Changed to backend directory"

# Stop any running backend process using the stop script's functions
if force_stop_backend; then
    echo "✅ Backend stopped successfully"
else
    echo "❌ Failed to stop backend"
    exit 1
fi

# Start the backend in development mode
echo "🚀 Starting backend..."
pnpm run start &
PID=$!
echo $PID > ../backend.pid
echo "📝 Backend started with PID: $PID"

# Wait briefly for backend to start
echo "⏳ Waiting 5 seconds for backend to start..."
sleep 5
echo "✅ Backend startup wait complete"