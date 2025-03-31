#!/usr/bin/env node

import { execSync } from 'child_process'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Make sure we're in the project root
process.chdir(resolve(__dirname, '..'))

// Wait for PostgreSQL to be ready (in Docker environment)
console.log('Waiting for database connection to be ready...')

// Function to try connections with exponential backoff
const tryDatabaseConnection = async (maxRetries = 10, initialDelay = 1000) => {
  let retries = 0
  let delay = initialDelay

  while (retries < maxRetries) {
    try {
      console.log(
        `Attempt ${retries + 1}/${maxRetries} to connect to database...`
      )
      // Run a simple database check
      execSync('npx knex migrate:status', {
        stdio: ['ignore', 'ignore', 'pipe'],
      })
      console.log('Database connection established!')
      return true
    } catch (error) {
      retries++

      if (retries >= maxRetries) {
        console.log(
          `Maximum retries (${maxRetries}) reached. Unable to connect to database.`
        )
        return false
      }

      console.log(`Connection failed. Retrying in ${delay / 1000} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay = Math.min(delay * 1.5, 10000) // Exponential backoff with 10s cap
    }
  }

  return false
}

const startApp = async () => {
  try {
    // Wait for database to be ready
    const isDbReady = await tryDatabaseConnection()
    if (!isDbReady) {
      console.log('Will continue without database connectivity')
    } else {
      // Run migrations
      console.log('Running database migrations...')
      try {
        execSync('npm run db:migrate', { stdio: 'inherit' })
        console.log('Migrations complete')

        // Ensure demo data
        console.log('Ensuring demo data exists...')
        execSync('npm run db:ensure-demo', { stdio: 'inherit' })
        console.log('Demo data setup complete')
      } catch (error) {
        console.error('Error during database setup:', error.message)
        console.log('Will continue without full database initialization')
      }
    }

    // Start the app
    console.log('Starting application...')
    // Set the correct port based on environment
    const nodeEnv = process.env.NODE_ENV || 'development'
    process.env.PORT = nodeEnv === 'production' ? '6000' : '6001'
    console.log(`Using port ${process.env.PORT} for environment ${nodeEnv}`)

    execSync('node server.js', { stdio: 'inherit' })
  } catch (error) {
    console.error('Error starting application:', error)
    process.exit(1)
  }
}

startApp()
