-- Use a prepared statement approach with a template that can be filled by environment variables
-- This file will be processed by a shell script that replaces placeholders before execution

-- Don't drop the database if it exists (this causes issues in Docker)
-- Instead, only create the database if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'finance') THEN
        CREATE DATABASE "finance";
    END IF;
END
$$;

-- Create database user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'finance') THEN
        CREATE USER "finance" WITH PASSWORD 'UHHw@!.Di*bcJaz-a3LJ*Q8-';
    ELSE
        ALTER USER "finance" WITH PASSWORD 'UHHw@!.Di*bcJaz-a3LJ*Q8-';
    END IF;
END
$$;

-- Change ownership of the database to the user (only if database exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_database WHERE datname = 'finance') THEN
        EXECUTE format('ALTER DATABASE "finance" OWNER TO "finance"');
    END IF;
END
$$;

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE "finance" TO "finance";

-- Connect to the database to create extensions
\c "finance";

-- Enable required extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set search path
ALTER DATABASE "finance" SET search_path TO public;

-- Ensure the user has the right permissions
ALTER USER "finance" WITH SUPERUSER; 