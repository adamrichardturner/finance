#!/bin/bash
set -e

# Ensure env vars are loaded first
if [ ! -f .env ]; then
  echo "Error: .env file not found! Please create one."
  exit 1
fi

# Export the environment variables explicitly from .env
echo "Loading environment variables..."
export $(grep -v '^#' .env | xargs)

# Start PostgreSQL using Docker
echo "Starting PostgreSQL..."
npm run docker:up

# Wait for PostgreSQL to be ready with a more reliable check
echo "Waiting for PostgreSQL to be ready..."
max_attempts=20
attempt=0
while [ $attempt -lt $max_attempts ]; do
  attempt=$((attempt+1))
  echo "Attempt $attempt of $max_attempts..."
  
  if docker-compose exec postgres pg_isready -U ${DB_USER} 2>/dev/null; then
    echo "PostgreSQL is ready!"
    break
  fi
  
  if [ $attempt -eq $max_attempts ]; then
    echo "Timed out waiting for PostgreSQL to be ready"
    exit 1
  fi
  
  echo "PostgreSQL not ready yet. Waiting 2 seconds..."
  sleep 2
done

# Skip password reset since we don't have a postgres superuser
# The correct password should be set via the DB_PASSWORD env var in docker-compose.yml
echo "Skipping password reset - using credentials from environment variables"

# Initialize the database with migrations and demo data
echo "Running migrations..."
npm run docker:migrate

# Start the development server
echo "Starting development server..."
echo "The application will be available at http://localhost:6001"
npm run dev -- --host 0.0.0.0 --port 6001 