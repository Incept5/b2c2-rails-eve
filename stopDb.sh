#!/bin/bash

echo "🛑 Stopping PostgreSQL container..."
docker-compose down || { echo "❌ Failed to stop PostgreSQL"; exit 1; }
echo "✅ PostgreSQL stopped successfully"
