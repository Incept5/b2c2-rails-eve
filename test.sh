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

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --force || { echo "❌ Failed to install dependencies"; exit 1; }
echo "✅ Dependencies installed successfully"

# Build the project
echo "🔨 Building project..."
pnpm run build || { echo "❌ Build failed"; exit 1; }
echo "✅ Build completed successfully"

# Run e2e tests
echo "🧪 Running e2e tests..."
pnpm run test:e2e || { echo "❌ E2E tests failed"; exit 1; }
echo "✅ E2e tests completed successfully"

echo "✨ Build and test process completed successfully"