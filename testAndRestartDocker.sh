#!/bin/bash

# Stop the containers
echo "Stopping Docker containers..."
docker-compose -f docker/docker-compose.yml down

# Run the tests
echo "Running tests..."
./test.sh
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "Tests failed! Not restarting containers."
    exit 1
fi

echo "Tests passed successfully. Restarting containers..."

# Start the containers in detached mode
docker-compose -f docker/docker-compose.yml up -d --build

# Wait for containers to be healthy
echo "Waiting for containers to be healthy..."
TIMEOUT=120  # 2 minutes timeout
ELAPSED=0
INTERVAL=10  # Check every 10 seconds

while [ $ELAPSED -lt $TIMEOUT ]; do
    if docker-compose -f docker/docker-compose.yml ps | grep -q "healthy"; then
        echo "Containers are healthy!"
        exit 0
    fi
    
    if docker-compose -f docker/docker-compose.yml ps | grep -q "unhealthy\|exit"; then
        echo "Container health check failed! Container logs:"
        docker-compose -f docker/docker-compose.yml logs
        echo "Error: Containers failed to start properly."
        exit 1
    fi
    
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
    echo "Still waiting for containers to be healthy... ($ELAPSED seconds elapsed)"
done

echo "Timeout waiting for containers to be healthy! Container logs:"
docker-compose -f docker/docker-compose.yml logs
echo "Error: Containers failed to start within timeout period."
exit 1