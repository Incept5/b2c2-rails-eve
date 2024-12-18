#!/bin/bash

# Build the project
./build.sh || { echo "❌ Build failed"; exit 1; }

# Restart the server
./restart.sh

echo "✨ Build and restart process completed successfully"