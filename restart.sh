#!/bin/bash

# Source the stop script to reuse its functions
source ./stop.sh

# Change to backend directory
cd backend || { echo "❌ Failed to change to backend directory"; exit 1; }
echo "📂 Changed to backend directory"

# Stop any running backend process using the stop script's functions
if main_stop; then
    echo "✅ Backend stopped successfully"
else
    echo "❌ Failed to stop backend"
    exit 1
fi

# Start the backend in production mode
echo "🚀 Starting backend in production mode..."
NODE_ENV=production nohup pnpm run start:prod > ../logs/backend.log 2>&1 &
PID=$!
echo $PID > ../backend.pid
echo "📝 Backend started with PID: $PID"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if check_backend; then
        echo "✅ Backend started successfully"
        exit 0
    fi
    sleep 1
done

echo "❌ Backend failed to start within timeout"
exit 1