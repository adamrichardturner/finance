#!/bin/bash
set -e

echo "==== Tearing down existing Docker containers ===="
npm run docker:down
npm run dev:stop 2>/dev/null || true

# Remove volumes to ensure a clean database
echo "==== Removing Docker volumes ===="
docker volume rm finance_postgres-data 2>/dev/null || true
docker volume rm finance_postgres-dev-data 2>/dev/null || true

# Ensure env vars are loaded
if [ ! -f .env ]; then
  echo "Error: .env file not found! Please create one."
  exit 1
fi

# Export the environment variables explicitly from .env
echo "Loading environment variables..."
export $(grep -v '^#' .env | xargs)

echo "==== Rebuilding Docker containers ===="
npm run docker:build

echo "==== Starting Docker containers ===="
npm run docker:up

echo "==== Waiting for PostgreSQL to be ready ===="
attempt=1
max_attempts=20
until docker exec $(docker-compose ps -q postgres) pg_isready -U ${DB_USER} 2>/dev/null || [ $attempt -eq $max_attempts ]; do
  echo "Waiting for PostgreSQL to start... (attempt $attempt of $max_attempts)"
  attempt=$((attempt+1))
  sleep 3
done

if [ $attempt -eq $max_attempts ]; then
  echo "Error: PostgreSQL did not start in time"
  exit 1
fi

echo "==== Running database migrations ===="
docker-compose exec -T app npm run db:migrate

echo "==== Initializing database with demo data ===="
docker-compose exec -T app node scripts/direct-demo-data.js

echo "==== Building application ===="
docker-compose exec -T app npm run build:fe

echo "==== Rebuild complete! ===="
echo "Run 'npm run dev:with-db' to start the application with the new database" 