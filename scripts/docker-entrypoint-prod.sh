#!/bin/sh
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -U ${DB_USER:-finance} -d ${DB_NAME:-finance}; do
  echo "PostgreSQL not ready yet... waiting"
  sleep 2
done
echo "PostgreSQL is ready!"

# Run migrations
echo "Running database migrations..."
npm run db:migrate

# Ensure demo data exists
echo "Ensuring demo data exists..."
npm run db:ensure-demo

# Start production server
echo "Starting production server..."
npm run start 