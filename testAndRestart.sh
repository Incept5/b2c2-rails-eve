#!/bin/bash

# Run tests first
./test.sh || { echo "❌ Tests failed"; exit 1; }

# If tests pass, restart the server
./restart.sh

echo "✨ Test and restart process completed successfully"