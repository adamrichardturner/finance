# Development Environment

This document explains how to use the development environment for the Finance application.

## Environment Variables

Before running the development environment, you must set up a `.env` file at the project root. Copy the example file as a starting point:

```bash
cp .env.example .env
```

The `.env` file should contain the following variables:

```
DB_USER=finance
DB_PASSWORD=finance-password
DB_NAME=finance
DB_PORT=5432
SESSION_SECRET=your_session_secret
DEMO_USER_ID=1  # IMPORTANT: Must be an integer, not a UUID
DEMO_PASSWORD_HASH=$2b$10$jhE2KcwlTVoe/uRWe/G/Z.9HT3Xbp13Tu6qBOPc0mLCCZO6w3YcIe
```

Make sure the database credentials (`DB_USER`, `DB_PASSWORD`) match what's in the Docker container.

## Starting the Development Environment

The development environment uses Docker to run both the application and the PostgreSQL database.

There are two ways to start the development environment:

### 1. Using the dev.sh script (Recommended)

This script will start PostgreSQL, run migrations, add demo data, and start the development server:

```bash
npm run dev:with-db
```

### 2. Using Docker Compose

```bash
npm run dev:start
```

Then, initialize the database:

```bash
npm run dev:init-db
```

## Viewing Logs

To view logs from both containers:

```bash
npm run dev:logs
```

## Stopping the Development Environment

When you're done working, stop the environment with:

```bash
npm run dev:stop
```

## Complete Rebuild

To completely tear down and rebuild the Docker environment:

```bash
npm run build:new
```

This command will:

1. Stop and remove all containers
2. Remove database volumes
3. Rebuild containers from scratch
4. Run migrations and initialize demo data

## Accessing the Database

You can connect to the PostgreSQL database using:

```bash
npm run docker:psql
```

## Troubleshooting

### Database Connection Issues

If you see authentication errors like `password authentication failed for user "finance"`:

1. Make sure your `.env` file has the correct database credentials
2. Try resetting the PostgreSQL password:
   ```bash
   docker-compose exec postgres psql -U postgres -c "ALTER USER finance WITH PASSWORD 'finance-password';"
   ```
3. If that doesn't work, try rebuilding the containers:
   ```bash
   npm run docker:restart
   ```

### Missing Tables or Data

If the database is running but tables or data are missing:

```bash
npm run db:migrate
npm run db:ensure-demo
```
