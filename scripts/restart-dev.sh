#!/bin/bash
set -e

echo "==== Restarting Development Environment ===="

# Stop all containers
echo "Stopping existing containers..."
npm run docker:down
npm run dev:stop 2>/dev/null || true

# Clear dependency caches that might be causing issues
echo "Clearing Vite cache..."
rm -rf node_modules/.vite || true

# Start development environment
echo "Starting development environment..."
npm run dev:start 

# Follow logs
echo "Development environment is starting up. Following logs..."
echo "Access the application at: http://localhost:5173"
npm run dev:logs 