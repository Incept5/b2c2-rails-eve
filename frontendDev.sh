#!/bin/bash

# Start frontend in development mode with hot reload
echo "🚀 Starting frontend development server..."
cd frontend || { echo "❌ Failed to change to frontend directory"; exit 1; }

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    pnpm install --silent || { echo "❌ Frontend dependency installation failed"; exit 1; }
    echo "🔧 Approving frontend native dependency builds..."
    echo -e "a\ny" | pnpm approve-builds >/dev/null 2>&1 || true
fi

echo "🔥 Starting Vite development server with hot reload..."
pnpm run dev || { echo "❌ Frontend development server failed to start"; exit 1; }
