#!/bin/bash

# Function to check if backend is running and healthy
check_backend() {
    if curl -s http://localhost:3000/api/monitoring/health > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to stop backend gracefully
stop_backend_gracefully() {
    echo "🔍 Checking if backend is running..."
    if check_backend; then
        echo "📋 Backend process found, attempting graceful shutdown..."
        curl -s -X POST http://localhost:3000/api/monitoring/shutdown
        sleep 3
        if ! check_backend; then
            echo "✅ Backend process stopped successfully"
            return 0
        fi
    fi
    return 1
}

# Function to force stop backend processes
force_stop_backend() {
    echo "⚠️  Attempting force stop of backend processes..."
    # Find and kill Node.js processes containing fullstack-starter in their path
    ps aux | grep "[n]ode.*fullstack-starter" | awk '{print $2}' | xargs -r kill -9
    sleep 1
    if check_backend; then
        echo "❌ Failed to stop all backend processes"
        return 1
    else
        echo "✅ Backend processes forcefully stopped"
        return 0
    fi
}

# Main stop function that orchestrates the stopping process
main_stop() {
    echo "🛑 Stopping backend services..."

    # Try graceful shutdown first
    if stop_backend_gracefully; then
        return 0
    fi

    # If graceful shutdown failed, try force stop
    echo "⚠️  Graceful shutdown failed or timed out"
    if force_stop_backend; then
        return 0
    else
        echo "❌ Failed to stop backend processes"
        return 1
    fi
}

# Only run the main function if this script is being run directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    if main_stop; then
        exit 0
    else
        exit 1
    fi
fi