#!/bin/bash

# Function to check if backend is running and healthy
check_backend() {
    if curl -s http://localhost:3000/api/monitoring/health > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to stop backend
stop_backend() {
    echo "🔍 Checking if backend is running..."
    if check_backend; then
        echo "📋 Backend process found, stopping it..."
        curl -s -X POST http://localhost:3000/api/monitoring/shutdown
        sleep 3
        if check_backend; then
            echo "❌ Failed to stop backend process"
            echo "Please check if the application is still running and stop it manually"
            exit 1
        else
            echo "✅ Backend process stopped successfully"
        fi
    else
        echo "ℹ️  No backend process found running"
    fi
}

# Change to backend directory
cd backend || { echo "❌ Failed to change to backend directory"; exit 1; }
echo "📂 Changed to backend directory"

# Stop any running backend process
stop_backend

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