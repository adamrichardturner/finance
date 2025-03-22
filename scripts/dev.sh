#!/bin/bash

# Start PostgreSQL using Docker
echo "Starting PostgreSQL..."
npm run docker:up

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
sleep 5

# Initialize the database
echo "Initializing database..."
npm run db:init

# Start the development server
echo "Starting development server..."
npm run dev 