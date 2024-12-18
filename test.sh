#!/bin/bash

# Function to run the test process
run_tests() {
    # Build the project
    ./build.sh || { echo "❌ Build failed"; return 1; }

    # Change to backend directory for tests
    cd backend || { echo "❌ Failed to change to backend directory"; return 1; }

    # Run e2e tests
    echo "🧪 Running e2e tests..."
    pnpm run test:e2e || { echo "❌ E2E tests failed"; return 1; }
    echo "✅ E2e tests completed successfully"

    # Change back to root directory
    cd .. || { echo "❌ Failed to change to root directory"; return 1; }

    echo "✨ Build and test process completed successfully"
    return 0
}

# Check if --log parameter is present
if [[ "$*" == *"--log"* ]]; then
    # Run tests with output redirected to log file
    (run_tests) > last_test_run.log 2>&1
    exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo "✨ Tests completed successfully. Check last_test_run.log for details."
    else
        echo "❌ Tests failed. Check last_test_run.log for details."
    fi
    exit $exit_code
else
    # Run tests with normal output
    run_tests
    exit $?
fi