#!/bin/bash

cd "$(dirname "$0")/docker"

echo "Stopping Docker containers..."
docker compose stop

echo "Rebuilding and starting Docker containers..."
docker compose up --build -d

echo "Docker containers restarted successfully!"