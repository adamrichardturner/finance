#!/bin/bash

# Ensure the script exits if any command fails
set -e

echo "Starting PostgreSQL and App containers..."

# Load environment variables
if [ -f .env ]; then
  echo "Loading environment variables from .env file"
  export $(grep -v '^#' .env | xargs)
else
  echo "No .env file found. Using default environment variables."
fi

# Set default values if environment variables are not set
DB_PORT=${DB_PORT:-5432}

# Create a network if it doesn't exist
docker network inspect my_network >/dev/null 2>&1 || docker network create my_network

# Set environment variables for PostgreSQL
export DB_USER=${DB_USER}
export DB_PASSWORD=${DB_PASSWORD}
export DB_NAME=${DB_NAME}
export DB_PORT=${DB_PORT}

# Check if SESSION_SECRET is set
if [ -z "$SESSION_SECRET" ]; then
  echo "Warning: SESSION_SECRET not set. Generating a random one."
  export SESSION_SECRET=$(openssl rand -hex 32)
  echo "SESSION_SECRET=$SESSION_SECRET" >> .env
fi

# Start PostgreSQL container
echo "Starting PostgreSQL container..."
docker run --name postgres-finance \
  -e POSTGRES_USER=$DB_USER \
  -e POSTGRES_PASSWORD=$DB_PASSWORD \
  -e POSTGRES_DB=$DB_NAME \
  -p $DB_PORT:5432 \
  -d \
  --network=my_network \
  postgres:15

echo "PostgreSQL container started"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Print connection info
echo "PostgreSQL connection info:"
echo "Host: localhost"
echo "Port: $DB_PORT"
echo "User: $DB_USER"
echo "Password: $DB_PASSWORD"
echo "Database: $DB_NAME"

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose down -v

# Build and start the containers
echo "Building and starting containers..."
docker-compose up -d --build

# Wait for the database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Run database migrations and seed data
echo "Running database migrations and seed data..."
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed

echo "Docker containers started successfully!"
echo "App should be available at: http://localhost:3000"
echo ""
echo "To check logs: npm run docker:logs"
echo "To access the database: npm run docker:psql"
echo "To stop: npm run docker:down" 