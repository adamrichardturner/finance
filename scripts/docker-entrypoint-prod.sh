#!/bin/sh
set -e

# Ensure NODE_ENV is set to production
export NODE_ENV=production

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

# Run all seed files using direct script (bypassing Knex CLI)
echo "Running all seed files..."
node --loader ts-node/esm scripts/run-direct-seeds.js

# Ensure demo data exists
echo "Ensuring demo data exists..."
npm run db:ensure-demo

# Start production server
echo "Starting production server..."
npm run start 