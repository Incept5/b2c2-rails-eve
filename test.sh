#!/bin/bash

# Build the project
./build.sh || { echo "❌ Build failed"; exit 1; }

# Change to backend directory for tests
cd backend || { echo "❌ Failed to change to backend directory"; exit 1; }

# Run e2e tests
echo "🧪 Running e2e tests..."
pnpm run test:e2e || { echo "❌ E2E tests failed"; exit 1; }
echo "✅ E2e tests completed successfully"

# Change back to root directory
cd .. || { echo "❌ Failed to change to root directory"; exit 1; }

echo "✨ Build and test process completed successfully"