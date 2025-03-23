#!/bin/bash

# This script processes the init-postgres.sql template and replaces environment variables
# It should be run before starting Docker containers

# Ensure the script exits if any command fails
set -e

# Source the .env file to get environment variables if it exists
if [ -f .env ]; then
  source .env
fi

# Create a temporary processed SQL file
TEMPLATE_FILE="./scripts/init-postgres.sql"
PROCESSED_FILE="./scripts/init-postgres-processed.sql"

# Make sure the required environment variables are set
if [ -z "$DB_USER" ]; then
  export DB_USER="finance"
  echo "Warning: DB_USER not set, using default: finance"
fi

if [ -z "$DB_NAME" ]; then
  export DB_NAME="finance"
  echo "Warning: DB_NAME not set, using default: finance"
fi

if [ -z "$DB_PASSWORD" ]; then
  echo "Error: DB_PASSWORD environment variable must be set"
  exit 1
fi

echo "Preparing database initialization script with:"
echo "  - Database User: $DB_USER"
echo "  - Database Name: $DB_NAME"
echo "  - Password: [HIDDEN]"

# Process the template file and replace variables
cat "$TEMPLATE_FILE" | 
  sed "s/\${DB_USER}/$DB_USER/g" | 
  sed "s/\${DB_NAME}/$DB_NAME/g" | 
  sed "s/\${DB_PASSWORD}/$DB_PASSWORD/g" > "$PROCESSED_FILE"

echo "Processed SQL file created at $PROCESSED_FILE"

# Make the processed file readable
chmod 644 "$PROCESSED_FILE"

echo "Database initialization script is ready to use with Docker" 