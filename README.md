# Banking App

A modern banking application built with Remix, PostgreSQL, and Knex.

## Features

- Display banking transactions, balances, budgets, and pots
- Database-driven backend with PostgreSQL
- Docker support for easy development

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

3. Start the application with database:

```bash
npm run dev:with-db
```

This script will:

- Start PostgreSQL using Docker
- Run database migrations and seed data
- Start the Remix development server

Alternatively, you can start components separately:

```bash
# Start PostgreSQL only
npm run docker:up

# Initialize the database
npm run db:init

# Start the development server
npm run dev
```

4. Open your browser at http://localhost:3000

## Database Management

- Run migrations: `npm run db:migrate`
- Run seeds: `npm run db:seed`
- Rollback migrations: `npm run db:rollback`

## Docker Commands

- Start services: `npm run docker:up`
- Stop services: `npm run docker:down`
- Rebuild containers: `npm run docker:build`

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
