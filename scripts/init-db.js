#!/usr/bin/env node

import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Make sure we're in the project root
process.chdir(resolve(__dirname, '..'))

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
  execSync('npm run db:migrate', { stdio: 'inherit' })
  console.log('Migrations complete')
} catch (error) {
  console.error('Error running migrations:', error.message)
  process.exit(1)
}

// Run seeds
try {
  console.log('Running seeds...')
  execSync('npm run db:seed', { stdio: 'inherit' })
  console.log('Seeding complete')
} catch (error) {
  console.error('Error running seeds:', error.message)
  process.exit(1)
}

console.log('Database initialization complete')
