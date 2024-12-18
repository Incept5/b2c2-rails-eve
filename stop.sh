#!/bin/bash

# Function to check if backend is running and healthy
check_backend() {
    if curl -s http://localhost:3000/api/monitoring/health > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to force stop backend processes
force_stop_backend() {
    echo "🛑 Stopping backend processes..."
    # Find and kill Node.js processes containing fullstack-starter in their path
    ps aux | grep "[n]ode.*fullstack-starter" | awk '{print $2}' | xargs -r kill -9
    sleep 1
    if check_backend; then
        echo "❌ Failed to stop all backend processes"
        return 1
    else
        echo "✅ Backend processes stopped successfully"
        return 0
    fi
}

# Only run the main function if this script is being run directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    if force_stop_backend; then
        exit 0
    else
        exit 1
    fi
fi