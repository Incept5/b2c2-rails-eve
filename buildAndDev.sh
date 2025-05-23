#!/bin/bash

# Start PostgreSQL with Docker Compose
echo "🐘 Starting PostgreSQL with Docker Compose..."
docker-compose up -d postgres || { echo "❌ Failed to start PostgreSQL"; exit 1; }

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done
echo "✅ PostgreSQL is ready"

# First run the build script
./build.sh || { echo "❌ Build failed"; exit 1; }

# Change to backend directory
cd backend || { echo "❌ Failed to change to backend directory"; exit 1; }
echo "📂 Changed to backend directory"

# Start the application in development mode with hot reloading
echo "🚀 Starting the application in development mode with hot reloading..."
echo "💡 The backend will automatically restart when you make changes to the source code"
pnpm run start:dev || { echo "❌ Failed to start the application in dev mode"; exit 1; }
