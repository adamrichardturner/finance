#!/bin/bash

# Ensure the script exits if any command fails
set -e

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please create one before running this script."
  exit 1
fi

# Source the .env file to get variables
source .env

# Check if DB_PASSWORD is set
if [ -z "$DB_PASSWORD" ]; then
  echo "Error: DB_PASSWORD must be set in your .env file."
  exit 1
fi

# Check if SESSION_SECRET is set
if [ -z "$SESSION_SECRET" ]; then
  echo "Warning: SESSION_SECRET not set. Generating a random one."
  export SESSION_SECRET=$(openssl rand -hex 32)
  echo "SESSION_SECRET=$SESSION_SECRET" >> .env
fi

echo "Starting Docker containers with environment variables from .env"

# Make the prepare script executable
chmod +x scripts/prepare-db-init.sh

# Process the SQL initialization file
echo "Preparing database initialization script..."
./scripts/prepare-db-init.sh

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose down -v

# Build and start the containers
echo "Building and starting containers..."
docker-compose up -d --build

# Wait for the database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run database migrations and seed data
echo "Running database migrations and seed data..."
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed

echo "Docker containers started successfully!"
echo "App should be available at: http://localhost:3000"
echo ""
echo "Database credentials:"
echo "  - User: $DB_USER"
echo "  - Password: [HIDDEN]"
echo "  - Database: $DB_NAME"
echo "  - Host: localhost (port 5432)"
echo ""
echo "To check logs: npm run docker:logs"
echo "To access the database: npm run docker:psql"
echo "To stop: npm run docker:down" 