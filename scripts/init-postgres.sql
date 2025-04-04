-- Use a prepared statement approach with a template that can be filled by environment variables
-- This file will be processed by a shell script that replaces placeholders before execution

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}') THEN
        CREATE DATABASE "${DB_NAME}";
    END IF;
END
$$;

-- Create database user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
        CREATE USER "${DB_USER}" WITH PASSWORD '${DB_PASSWORD}';
    ELSE
        ALTER USER "${DB_USER}" WITH PASSWORD '${DB_PASSWORD}';
    END IF;
END
$$;

-- Change ownership of the database to the user (only if database exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}') THEN
        EXECUTE format('ALTER DATABASE "${DB_NAME}" OWNER TO "${DB_USER}"');
    END IF;
END
$$;

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME}" TO "${DB_USER}";

-- Connect to the database to create extensions
\c "${DB_NAME}";

-- Enable required extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set search path
ALTER DATABASE "${DB_NAME}" SET search_path TO public;

-- Ensure the user has the right permissions
ALTER USER "${DB_USER}" WITH SUPERUSER; 