#!/usr/bin/env node

import { execSync } from 'child_process'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Make sure we're in the project root
process.chdir(resolve(__dirname, '..'))

// Set Docker environment
process.env.DOCKER_ENV = 'true'

console.log('Initializing development database...')

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

const initDb = async () => {
  try {
    // Ensure we have the necessary env variables
    const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT']
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    )

    if (missingVars.length > 0) {
      console.error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      )
      console.error(
        'Please set these variables in your .env file or environment'
      )
      return
    }

    // Wait for database to be ready
    const isDbReady = await tryDatabaseConnection()

    if (!isDbReady) {
      console.error(
        'Could not connect to database. Development environment may not work correctly.'
      )
      return
    }

    // Run migrations
    console.log('Running database migrations...')
    try {
      execSync('npm run docker:migrate', { stdio: 'inherit' })
      console.log('Migrations complete')

      // Ensure demo data
      console.log('Ensuring demo data exists...')
      execSync('npm run docker:ensure-demo', { stdio: 'inherit' })
      console.log('Demo data setup complete')
      console.log(
        'Database initialization complete! Your development environment is ready.'
      )
    } catch (error) {
      console.error('Error during database setup:', error.message)
    }
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

initDb()
