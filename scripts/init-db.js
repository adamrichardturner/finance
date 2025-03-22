#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')

// Make sure we're in the project root
process.chdir(path.resolve(__dirname, '..'))

// Create necessary directories if they don't exist
try {
  execSync('mkdir -p db/migrations db/seeds')
  console.log('Created db directories')
} catch (error) {
  console.error('Error creating directories:', error.message)
}

// Run migrations
try {
  console.log('Running migrations...')
  execSync('npx knex migrate:latest', { stdio: 'inherit' })
  console.log('Migrations complete')
} catch (error) {
  console.error('Error running migrations:', error.message)
  process.exit(1)
}

// Run seeds
try {
  console.log('Running seeds...')
  execSync('npx knex seed:run', { stdio: 'inherit' })
  console.log('Seeding complete')
} catch (error) {
  console.error('Error running seeds:', error.message)
  process.exit(1)
}

console.log('Database initialization complete')
