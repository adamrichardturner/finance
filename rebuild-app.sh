#!/bin/bash
set -e

# Stop any existing containers
docker compose down --volumes

# Remove any existing PostgreSQL data volume
docker volume rm finance_postgres-data 2>/dev/null || true

# Process the SQL template (add this if you're using it)
node scripts/process-sql-template.js || {
  echo "Error processing SQL template. Making sure dotenv is installed."
  npm install dotenv
  node scripts/process-sql-template.js
}

# Rebuild containers from scratch
docker compose build --no-cache

# Start the containers in detached mode
docker compose up -d

echo "Finance app rebuilt and started successfully" 