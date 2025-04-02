#!/bin/bash
set -e

# Helper function for colored output
function print_message() {
  GREEN='\033[0;32m'
  BLUE='\033[0;34m'
  YELLOW='\033[1;33m'
  NC='\033[0m' # No Color
  
  case "$1" in
    "info") echo -e "${BLUE}ℹ️ $2${NC}" ;;
    "success") echo -e "${GREEN}✅ $2${NC}" ;;
    "warning") echo -e "${YELLOW}⚠️ $2${NC}" ;;
    *) echo "$2" ;;
  esac
}

# Clean up existing containers
print_message "info" "Cleaning up existing containers and volumes..."
docker compose -f docker-compose.dev.yml down --volumes

# Remove PostgreSQL data volume if it exists
print_message "info" "Removing any existing PostgreSQL data..."
docker volume rm finance_postgres-data 2>/dev/null || true

# Build containers
print_message "info" "Building containers..."
docker compose -f docker-compose.dev.yml build

# Start containers in detached mode
print_message "info" "Starting containers in development mode..."
docker compose -f docker-compose.dev.yml up -d

# Wait for PostgreSQL to be ready
print_message "info" "Waiting for PostgreSQL to be ready..."
max_attempts=30
counter=0
while ! docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U finance -d finance >/dev/null 2>&1; do
  counter=$((counter+1))
  if [ $counter -ge $max_attempts ]; then
    print_message "warning" "PostgreSQL failed to become ready in time!"
    docker compose -f docker-compose.dev.yml logs postgres
    exit 1
  fi
  echo "⏳ Waiting for PostgreSQL... (Attempt $counter/$max_attempts)"
  sleep 2
done
print_message "success" "PostgreSQL is ready"

# Wait for initial startup to complete
sleep 5

# Run migrations
print_message "info" "Running database migrations..."
docker compose -f docker-compose.dev.yml exec -T app npm run db:migrate || {
  print_message "warning" "Migration failed! Showing logs:"
  docker compose -f docker-compose.dev.yml logs app
}

# Ensure demo data
print_message "info" "Ensuring demo data exists..."
docker compose -f docker-compose.dev.yml exec -T app npm run db:ensure-demo || {
  print_message "warning" "Demo data setup failed! Showing logs:"
  docker compose -f docker-compose.dev.yml logs app
}

# Success message
print_message "success" "Development environment is ready!"
print_message "success" "Frontend available at http://localhost:5173"
print_message "info" "Showing logs (Ctrl+C to exit)..."

# Show logs
docker compose -f docker-compose.dev.yml logs -f 