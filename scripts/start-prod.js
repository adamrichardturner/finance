#!/usr/bin/env node

/**
 * Production startup script that sets required environment variables
 * before starting the server
 */

import { execSync } from 'child_process'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import fs from 'fs'

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Make sure we're in the project root
process.chdir(resolve(__dirname, '..'))

// Set production environment
process.env.NODE_ENV = 'production'

// Load environment from .env file
config({ path: resolve(process.cwd(), '.env') })

// Define fallback values for required environment variables
const requiredEnvVars = {
  DEMO_USER_ID: '1',
  DEMO_PASSWORD_HASH:
    '$2b$10$3euPcmQFCiblsZeEu5s7p.9WxiKIUx0M9MNT8sMrUvRTCRaJPAJCa',
  DB_USER: 'finance',
  DB_PASSWORD: process.env.DB_PASSWORD || 'finance',
  DB_NAME: 'finance',
}

// Set missing environment variables with fallback values
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!process.env[key]) {
    process.env[key] = value
    console.log(`Setting ${key} from defaults`)
  }
}

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  const dbHost = process.env.DB_HOST || 'localhost'
  const dbPort = process.env.DB_PORT || '5432'
  process.env.DATABASE_URL = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${dbHost}:${dbPort}/${process.env.DB_NAME}`
  console.log(
    `Setting DATABASE_URL to ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')}`
  )
}

// Execute the server
try {
  console.log('Starting production server...')

  // Run set-port.js to ensure PORT is set correctly for production
  execSync('npm run set-port', { stdio: 'inherit' })

  // Start the server
  execSync('node server.js', { stdio: 'inherit' })
} catch (error) {
  console.error('Error starting the server:', error)
  process.exit(1)
}
