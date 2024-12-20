#!/bin/bash

# Stop the containers
echo "Stopping Docker containers..."
docker compose -f docker/docker-compose.yml down

# Run the tests
echo "Running tests..."
./test.sh
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "Tests failed! Not restarting containers."
    exit 1
fi

echo "Tests passed successfully. Restarting containers..."

# Start the containers using the common script
./startDocker.sh