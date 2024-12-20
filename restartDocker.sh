#!/bin/bash

echo "Stopping Docker containers..."
docker compose -f docker/docker-compose.yml down

echo "Starting Docker containers..."
./startDocker.sh