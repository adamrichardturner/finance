#!/usr/bin/env node

// This script processes the SQL template file and replaces environment variables

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Input template file
const templatePath = path.join(__dirname, 'init-postgres.sql')
// Output processed file
const outputPath = path.join(__dirname, 'init-postgres-processed.sql')

console.log('Processing SQL template...')

// Check for required environment variables
const requiredVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD']
const missingVars = requiredVars.filter((varName) => !process.env[varName])

if (missingVars.length > 0) {
  console.error(
    `ERROR: Missing required environment variables: ${missingVars.join(', ')}`
  )
  console.error('Please set these variables in your .env file')
  process.exit(1)
}

// Read the template file
let template = fs.readFileSync(templatePath, 'utf8')

// Replace all environment variables in the format ${VAR_NAME}
template = template.replace(/\${([A-Za-z0-9_]+)}/g, (match, varName) => {
  const value = process.env[varName] || ''

  // Log that we're replacing a variable (but don't expose sensitive values)
  if (varName.includes('PASSWORD')) {
    console.log(`Replacing ${varName} with [REDACTED]`)
  } else {
    console.log(`Replacing ${varName} with "${value}"`)
  }

  return value
})

// Write the processed file
fs.writeFileSync(outputPath, template)

console.log(`Processed SQL template written to ${outputPath}`)
