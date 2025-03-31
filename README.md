# Banking App

A modern banking application built with Remix, PostgreSQL, and Knex.

## Features

- Display banking transactions, balances, budgets, and pots
- Database-driven backend with PostgreSQL
- Docker support for easy development
- Secure authentication with session management

## Prerequisites

- Node.js (v20+)
- Docker and Docker Compose
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd finance
```

2. Install dependencies:

```bash
npm install
```

3. Create environment variables:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your secure credentials
# Be sure to set DB_PASSWORD and SESSION_SECRET
nano .env
```

4. Start the application with Docker:

```bash
./scripts/docker-start.sh
```

This script will:

- Process environment variables
- Start PostgreSQL and the app using Docker Compose
- Run database migrations and seed data
- Initialize the application

Alternatively, you can start components separately:

```bash
# Start PostgreSQL only
npm run docker:up

# Initialize the database
npm run db:init

# Start the development server
npm run dev
```

5. Open your browser at http://localhost:6001

## Environment Variables

The application uses environment variables for configuration:

| Variable       | Description                   | Default     |
| -------------- | ----------------------------- | ----------- |
| DB_USER        | Database username             | finance     |
| DB_PASSWORD    | Database password             | (required)  |
| DB_HOST        | Database host                 | localhost   |
| DB_PORT        | Database port                 | 5432        |
| DB_NAME        | Database name                 | finance     |
| SESSION_SECRET | Secret for session encryption | (required)  |
| NODE_ENV       | Application environment       | development |

## Database Management

- Run migrations: `npm run db:migrate`
- Run seeds: `npm run db:seed`
- Rollback migrations: `npm run db:rollback`

## Docker Commands

- Start all services: `./scripts/docker-start.sh`
- Start services only: `npm run docker:up`
- Stop services: `npm run docker:down`
- Rebuild containers: `npm run docker:build`
- View logs: `npm run docker:logs`
- Connect to database: `npm run docker:psql`
- Access app shell: `npm run docker:shell`

## Changing Database Password

To change the database password:

1. Update the DB_PASSWORD in your .env file
2. Run `./scripts/docker-start.sh` to rebuild containers with the new password

## Production Deployment

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Project Structure

- `/app` - Remix application
- `/db` - Database migrations and seeds
- `/public` - Static assets
- `/app/services` - Business logic
- `/app/routes` - Remix routes

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- Docker and Docker Compose

### Setting up the development environment

1. Clone the repository
2. Create a `.env` file based on the example:

```bash
cp .env.example .env
```

3. Make sure your `.env` file contains the following variables:

```bash
DB_USER=finance
DB_PASSWORD=finance-password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance
SESSION_SECRET=your_session_secret
DEMO_USER_ID=1
DEMO_PASSWORD_HASH=$2b$10$jhE2KcwlTVoe/uRWe/G/Z.9HT3Xbp13Tu6qBOPc0mLCCZO6w3YcIe
```

4. Start the development environment:

```bash
npm run dev:with-db
```

This will:

- Start PostgreSQL in a Docker container
- Run migrations and add demo data
- Start the Remix development server

For more detailed information about the development environment, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Using the application

Once the application is running, you can access it at http://localhost:6001.

Use the demo account to log in:

- Email: demo@example.com
- Password: demo-password

## License

[MIT](LICENSE)
