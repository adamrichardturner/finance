#!/bin/bash

# Ensure the script exits if any command fails
set -e

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please create one before running this script."
  exit 1
fi

# Export environment variables manually
export NODE_ENV=development
export DATABASE_URL=postgres://finance:UHHw@!.Di*bcJaz-a3LJ*Q8-@localhost:5432/finance
export DB_USER=finance
export DB_PASSWORD="UHHw@!.Di*bcJaz-a3LJ*Q8-"
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=finance
export SESSION_SECRET=n6L-FfNhDosCEuMxRFch3HuGjM6y_-KM

echo "Exported environment variables for Docker Compose"

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