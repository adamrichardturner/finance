#!/usr/bin/env node

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import fs from 'fs'
import knex from 'knex'

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Make sure we're in the project root
process.chdir(resolve(__dirname, '..'))

// Load environment variables from .env file
config({ path: resolve(__dirname, '.env') })

// Get environment variables
const DEMO_USER_ID_RAW = process.env.DEMO_USER_ID
const DEMO_PASSWORD_HASH = process.env.DEMO_PASSWORD_HASH
const { DATABASE_URL, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } =
  process.env

// Check required environment variables
const requiredEnvVars = [
  'DEMO_USER_ID',
  'DEMO_PASSWORD_HASH',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
]
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

if (missingVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingVars.join(', ')}`
  )
  console.error('Please set these variables in your .env file or environment')
  process.exit(1)
}

// Convert DEMO_USER_ID to an integer (the users table has an integer primary key)
const DEMO_USER_ID = parseInt(DEMO_USER_ID_RAW, 10)

// Validate that it's a valid integer
if (isNaN(DEMO_USER_ID)) {
  console.error('Error: DEMO_USER_ID must be a valid integer')
  console.error('Current value:', DEMO_USER_ID_RAW)
  process.exit(1)
}

console.log('Using demo user ID:', DEMO_USER_ID)

// Create connection
const buildConnectionFromEnv = () => {
  // Check if we're in Docker environment
  const isDockerEnv = process.env.DOCKER_ENV === 'true'

  // In Docker environment, use service name 'postgres' instead of localhost
  const host = isDockerEnv ? 'postgres' : DB_HOST || 'localhost'
  const port = DB_PORT || '5432'

  console.log(`Environment: ${isDockerEnv ? 'Docker' : 'Local'}`)
  console.log(`Attempting to connect to database at ${host}:${port}`)
  console.log(`Using database user: ${DB_USER}`)

  // If DATABASE_URL is provided, use it directly
  if (DATABASE_URL) {
    console.log(
      `Using provided DATABASE_URL: ${DATABASE_URL.replace(/:[^:]*@/, ':****@')}`
    )
    return DATABASE_URL
  }

  // Otherwise build connection from parts
  if (DB_USER && DB_PASSWORD && host && port && DB_NAME) {
    const config = {
      host,
      port: parseInt(port, 10),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    }
    console.log(
      `Using connection config: ${JSON.stringify({ ...config, password: '****' })}`
    )
    return config
  }

  throw new Error(
    'Insufficient database connection details provided in environment variables'
  )
}

const connection = buildConnectionFromEnv()
console.log(
  'Connecting to database:',
  typeof connection === 'string'
    ? connection
    : JSON.stringify({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        user: connection.user,
      })
)

// Setup database connection
const db = knex({
  client: 'pg',
  connection,
})

async function initDatabase() {
  try {
    // We no longer need the UUID extension
    // await db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    // Check if users table exists
    const hasUsersTable = await db.schema.hasTable('users')

    if (!hasUsersTable) {
      console.log('Creating users table...')
      await db.schema.createTable('users', (table) => {
        table.increments('id').primary() // Integer primary key
        table.string('email').notNullable().unique()
        table.string('password_hash').notNullable()
        table.string('full_name').notNullable()
        // For storing account recovery information
        table.string('recovery_token').nullable()
        table.dateTime('recovery_token_expires_at').nullable()
        // For multi-factor authentication
        table.boolean('mfa_enabled').defaultTo(false)
        table.string('mfa_secret').nullable()
        // Additional security measures
        table.specificType('previous_passwords', 'text[]').defaultTo('{}')
        table.integer('failed_login_attempts').defaultTo(0)
        table.dateTime('lockout_until').nullable()
        table.string('session_token').nullable()
        // For email verification
        table.boolean('email_verified').defaultTo(false)
        table.string('verification_token').nullable()
        // For security auditing
        table.string('last_ip_address').nullable()
        table.dateTime('last_login_at').nullable()
        table.timestamps(true, true)
      })

      // Separate table for refresh tokens with many-to-one relationship to users
      await db.schema.createTable('refresh_tokens', (table) => {
        table.increments('id').primary()
        table.integer('user_id').notNullable() // Integer foreign key
        table.foreign('user_id').references('users.id').onDelete('CASCADE')
        table.string('token').notNullable().unique()
        table.dateTime('expires_at').notNullable()
        table.boolean('is_revoked').defaultTo(false)
        table.string('device_info').nullable()
        table.timestamps(true, true)
      })

      // Login history for security auditing
      await db.schema.createTable('login_history', (table) => {
        table.increments('id').primary()
        table.integer('user_id').notNullable() // Integer foreign key
        table.foreign('user_id').references('users.id').onDelete('CASCADE')
        table.string('ip_address').notNullable()
        table.string('user_agent').nullable()
        table.string('location').nullable()
        table.boolean('success').notNullable()
        table.string('failure_reason').nullable()
        table.timestamps(true, true)
      })

      console.log('Created users tables')
    }

    // Check if financial tables exist
    const hasBalanceTable = await db.schema.hasTable('balance')

    if (!hasBalanceTable) {
      console.log('Creating financial tables...')

      // Create balance table
      await db.schema.createTable('balance', (table) => {
        table.increments('id').primary()
        table.decimal('current', 10, 2).notNullable()
        table.decimal('income', 10, 2).notNullable()
        table.decimal('expenses', 10, 2).notNullable()
        table.integer('user_id').notNullable().index() // Integer foreign key
        table.timestamps(true, true)
      })

      // Create transactions table
      await db.schema.createTable('transactions', (table) => {
        table.increments('id').primary()
        table.string('avatar').notNullable()
        table.string('name').notNullable()
        table.string('category').notNullable()
        table.timestamp('date').notNullable()
        table.decimal('amount', 10, 2).notNullable()
        table.boolean('recurring').defaultTo(false)
        table.integer('user_id').notNullable().index() // Integer foreign key
        table.timestamps(true, true)
      })

      // Create budgets table
      await db.schema.createTable('budgets', (table) => {
        table.increments('id').primary()
        table.string('category').notNullable()
        table.decimal('maximum', 10, 2).notNullable()
        table.string('theme').notNullable()
        table.integer('user_id').notNullable().index() // Integer foreign key
        table.unique(['category', 'user_id'])
        table.timestamps(true, true)
      })

      // Create pots table
      await db.schema.createTable('pots', (table) => {
        table.increments('id').primary()
        table.string('name').notNullable()
        table.decimal('target', 10, 2).notNullable()
        table.decimal('total', 10, 2).notNullable()
        table.string('theme').notNullable()
        table.integer('user_id').notNullable().index() // Integer foreign key
        table.timestamps(true, true)
      })

      console.log('Created financial tables')
    }

    // Add demo user and financial data
    await createDemoUser()
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  } finally {
    await db.destroy()
  }
}

async function createDemoUser() {
  try {
    // Read the demo financial data from data.json
    const dataPath = resolve(__dirname, '../app/lib/data.json')
    const jsonContent = fs.readFileSync(dataPath, 'utf8')
    const demoData = JSON.parse(jsonContent)

    // Check if demo user already exists
    const existingUser = await db('users').where({ id: DEMO_USER_ID }).first()

    if (!existingUser) {
      console.log('Creating demo user...')

      // Create the demo user
      await db('users').insert({
        id: DEMO_USER_ID,
        email: 'demo@example.com',
        password_hash: DEMO_PASSWORD_HASH,
        full_name: 'Demo User',
        email_verified: true,
        mfa_enabled: false,
        failed_login_attempts: 0,
        previous_passwords: '{}',
        created_at: new Date(),
        updated_at: new Date(),
      })

      console.log('Demo user created successfully')
    } else {
      console.log('Demo user already exists, skipping user creation')
    }

    // Check if financial data is already loaded for the demo user
    const existingBalance = await db('balance')
      .where({ user_id: DEMO_USER_ID })
      .first()

    if (!existingBalance) {
      console.log('Adding demo financial data...')

      // Run operations within a transaction to ensure integrity
      await db.transaction(async (trx) => {
        // Insert balance data
        await trx('balance').insert({
          current: demoData.balance.current,
          income: demoData.balance.income,
          expenses: demoData.balance.expenses,
          user_id: DEMO_USER_ID,
          created_at: new Date(),
          updated_at: new Date(),
        })

        // Insert transactions
        if (demoData.transactions && Array.isArray(demoData.transactions)) {
          const transactionRecords = demoData.transactions.map(
            (transaction) => ({
              avatar: transaction.avatar || '',
              name: transaction.name,
              category: transaction.category,
              date: new Date(transaction.date),
              amount: transaction.amount,
              recurring: transaction.recurring || false,
              user_id: DEMO_USER_ID,
              created_at: new Date(),
              updated_at: new Date(),
            })
          )

          await trx('transactions').insert(transactionRecords)
        }

        // Insert budgets
        if (demoData.budgets && Array.isArray(demoData.budgets)) {
          const budgetRecords = demoData.budgets.map((budget) => ({
            category: budget.category,
            maximum: budget.maximum,
            theme: budget.theme,
            user_id: DEMO_USER_ID,
            created_at: new Date(),
            updated_at: new Date(),
          }))

          await trx('budgets').insert(budgetRecords)
        }

        // Insert savings pots
        if (demoData.pots && Array.isArray(demoData.pots)) {
          const potRecords = demoData.pots.map((pot) => ({
            name: pot.name,
            target: pot.target,
            total: pot.total,
            theme: pot.theme,
            user_id: DEMO_USER_ID,
            created_at: new Date(),
            updated_at: new Date(),
          }))

          await trx('pots').insert(potRecords)
        }
      })

      console.log('Demo financial data added successfully')
    } else {
      console.log('Demo financial data already exists, skipping data creation')
    }
  } catch (error) {
    console.error('Error creating demo user:', error)
    throw error
  }
}

// Run the database initialization with retry logic
async function initDatabaseWithRetry(maxRetries = 5, initialDelay = 2000) {
  let retries = 0
  let delay = initialDelay

  // If we're in Docker environment, add some initial delay to ensure
  // PostgreSQL is fully ready to accept connections
  if (process.env.DOCKER_ENV === 'true') {
    console.log('Docker environment detected, adding initial delay...')
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  while (retries < maxRetries) {
    try {
      console.log(
        `Attempt ${retries + 1}/${maxRetries} to initialize database...`
      )
      await initDatabase()
      console.log('Database initialization complete!')
      process.exit(0)
    } catch (err) {
      retries++

      console.error(`Database error: ${err.message}`)
      if (err.code === '28P01') {
        console.error(
          'Authentication failed - check your DB_USER and DB_PASSWORD environment variables'
        )
        console.error('Make sure these match the PostgreSQL container settings')
      }

      if (retries >= maxRetries) {
        console.error(
          'Maximum retries reached. Database initialization failed.'
        )
        process.exit(1)
      }

      console.log(`Connection failed. Retrying in ${delay / 1000} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Increase delay for next retry (exponential backoff)
      delay = Math.min(delay * 1.5, 15000) // Cap at 15 seconds
    }
  }
}

// Start the initialization with retry
initDatabaseWithRetry().catch((err) => {
  console.error('Unexpected error during database initialization:', err)
  process.exit(1)
})
