// Simple script to run seeds directly without using the Knex CLI
import knex from 'knex'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables based on NODE_ENV
const NODE_ENV = process.env.NODE_ENV || 'development'
console.log(`Seeds using environment: ${NODE_ENV}`)

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${NODE_ENV}`),
})

// Fallback to .env if environment-specific file doesn't exist
if (!process.env.DEMO_USER_ID || !process.env.DEMO_PASSWORD_HASH) {
  console.log(
    `No user variables found in .env.${NODE_ENV}, falling back to .env`
  )
  dotenv.config()
}

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Import database configuration from knexfile
import config from '../knexfile.js'

const DEMO_USER_ID = process.env.DEMO_USER_ID
const DEMO_PASSWORD_HASH = process.env.DEMO_PASSWORD_HASH

// Direct implementation of the initial_data.ts seed functionality
async function runInitialDataSeed(db) {
  console.log('Seeding demo user data from data.json...')

  // Check if demo user data already exists
  const existingBalance = await db('balance')
    .where({ user_id: DEMO_USER_ID })
    .first()

  if (existingBalance) {
    console.log(
      'Demo user data exists. Clearing existing data before reseeding...'
    )
  }

  // Read data from JSON file (using a direct path that doesn't need import.meta)
  const dataPath = path.resolve(__dirname, '../app/lib/data.json')
  const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  // Clear existing demo user data
  await db('pots').where({ user_id: DEMO_USER_ID }).del()
  await db('transactions').where({ user_id: DEMO_USER_ID }).del()
  await db('budgets').where({ user_id: DEMO_USER_ID }).del()
  await db('categories').where({ user_id: DEMO_USER_ID }).del()
  await db('balance').where({ user_id: DEMO_USER_ID }).del()

  // First make sure demo user exists
  const demoUser = await db('users').where({ id: DEMO_USER_ID }).first()

  if (!demoUser) {
    console.log('Creating demo user...')

    if (!DEMO_PASSWORD_HASH) {
      throw new Error(
        'DEMO_PASSWORD_HASH environment variable is required but not set'
      )
    }

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
  }

  // Insert balance data
  await db('balance').insert({
    current: jsonData.balance.current,
    income: jsonData.balance.income,
    expenses: jsonData.balance.expenses,
    user_id: DEMO_USER_ID,
  })

  // Insert categories and store their IDs
  const categoryMap = new Map()

  if (jsonData.categories && Array.isArray(jsonData.categories)) {
    const categoryRows = await db('categories')
      .insert(
        jsonData.categories.map((category) => ({
          name: category.name,
          default_theme: category.defaultTheme,
          user_id: DEMO_USER_ID,
          created_at: new Date(),
          updated_at: new Date(),
        }))
      )
      .returning(['id', 'name'])

    // Create a map of category names to their IDs
    for (const row of categoryRows) {
      categoryMap.set(row.name, row.id)
    }
  }

  // Insert budgets with category IDs
  const budgetMap = new Map()
  if (jsonData.budgets && Array.isArray(jsonData.budgets)) {
    for (const budget of jsonData.budgets) {
      const categoryId = categoryMap.get(budget.category)

      if (!categoryId) {
        console.warn(
          `Warning: Category ${budget.category} not found for budget`
        )
        continue
      }

      // Insert budget with category_id
      const [budgetRow] = await db('budgets')
        .insert({
          category: budget.category,
          category_id: categoryId,
          maximum: budget.maximum,
          theme: budget.theme,
          user_id: DEMO_USER_ID,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('id')

      if (!budgetRow) {
        console.warn(
          `Warning: Failed to insert budget for category ${budget.category}`
        )
        continue
      }

      budgetMap.set(budget.category, budgetRow.id)
    }
  }

  // Insert transactions with both budget_id and category_id
  if (jsonData.transactions && Array.isArray(jsonData.transactions)) {
    for (const transaction of jsonData.transactions) {
      const categoryId = categoryMap.get(transaction.category)
      const budgetId = budgetMap.get(transaction.category)

      if (!categoryId) {
        console.warn(
          `Warning: Category ${transaction.category} not found for transaction`
        )
        continue
      }

      const transactionData = {
        avatar: transaction.avatar,
        name: transaction.name,
        category: transaction.category,
        date: new Date(transaction.date),
        amount: transaction.amount,
        recurring: transaction.recurring,
        category_id: categoryId,
        budget_id: budgetId || null,
        user_id: DEMO_USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      }

      try {
        await db('transactions').insert(transactionData)
      } catch (error) {
        console.error(`Error inserting transaction: ${transaction.name}`, error)
        console.error('Transaction data:', transactionData)
      }
    }
  }

  // Insert pot data
  if (jsonData.pots && Array.isArray(jsonData.pots)) {
    await db('pots').insert(
      jsonData.pots.map((pot) => ({
        ...pot,
        user_id: DEMO_USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    )
  }

  console.log('Demo user data seeded successfully!')
}

// Create database connection with the production config
const db = knex(config.production)

async function runSeeds() {
  try {
    console.log('Running seeds directly without using Knex CLI...')

    // Get seed files
    const seedDir = path.join(__dirname, '../db/seeds')
    const seedFiles = fs.readdirSync(seedDir).sort()

    for (const file of seedFiles) {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        console.log(`Running seed: ${file}`)

        try {
          // Special case for initial_data.ts which has ESM compatibility issues
          if (file === 'initial_data.ts') {
            console.log(
              'Running initial_data seed with direct implementation...'
            )

            // We'll implement the core functionality of the seed directly
            await runInitialDataSeed(db)
            console.log(`✅ Seed ${file} completed successfully`)
          } else {
            // For JavaScript files, import and run directly
            const seedModule = await import(path.join(seedDir, file))

            if (typeof seedModule.seed === 'function') {
              await seedModule.seed(db)
              console.log(`✅ Seed ${file} completed successfully`)
            } else {
              console.warn(`⚠️ Seed ${file} has no seed function, skipping`)
            }
          }
        } catch (err) {
          console.error(`❌ Error running seed ${file}:`, err)
        }
      }
    }

    console.log('All seeds completed!')
  } catch (error) {
    console.error('Error running seeds:', error)
    process.exit(1)
  } finally {
    await db.destroy()
  }
}

runSeeds()
