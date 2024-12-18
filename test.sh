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

# Run e2e tests
echo "🧪 Running e2e tests..."
pnpm run test:e2e || { echo "❌ E2E tests failed"; exit 1; }
echo "✅ E2e tests completed successfully"

echo "✨ Build and test process completed successfully"