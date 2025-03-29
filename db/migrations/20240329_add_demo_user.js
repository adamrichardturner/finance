import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { config } from 'dotenv'

// Load environment variables from .env file if exists
config()

// Get environment variables with validation
const DEMO_USER_ID_RAW = process.env.DEMO_USER_ID
const DEMO_PASSWORD_HASH = process.env.DEMO_PASSWORD_HASH

// Check required environment variables
if (!DEMO_USER_ID_RAW || !DEMO_PASSWORD_HASH) {
  console.error(
    'Error: DEMO_USER_ID and DEMO_PASSWORD_HASH environment variables are required'
  )
  console.error('Please set these in your .env file or environment variables')
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

export async function up(knex) {
  // Get directory path to read data.json
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const dataPath = path.resolve(__dirname, '../../app/lib/data.json')

  // Read the demo financial data from data.json
  const jsonContent = fs.readFileSync(dataPath, 'utf8')
  const demoData = JSON.parse(jsonContent)

  // Check if demo user already exists (to make migration idempotent)
  const existingUser = await knex('users').where({ id: DEMO_USER_ID }).first()

  if (!existingUser) {
    console.log('Creating demo user...')

    // 1. Create the demo user
    await knex('users').insert({
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
  } else {
    console.log('Demo user already exists, skipping user creation')
  }

  // Check if financial data is already loaded for the demo user
  const existingBalance = await knex('balance')
    .where({ user_id: DEMO_USER_ID })
    .first()

  if (!existingBalance) {
    console.log('Adding demo financial data...')

    // Run operations within a transaction to ensure integrity
    await knex.transaction(async (trx) => {
      // 2. Insert balance data
      await trx('balance').insert({
        current: demoData.balance.current,
        income: demoData.balance.income,
        expenses: demoData.balance.expenses,
        user_id: DEMO_USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      })

      // 3. Insert transactions
      if (demoData.transactions && Array.isArray(demoData.transactions)) {
        const transactionRecords = demoData.transactions.map((transaction) => ({
          avatar: transaction.avatar || '',
          name: transaction.name,
          category: transaction.category,
          date: new Date(transaction.date),
          amount: transaction.amount,
          recurring: transaction.recurring || false,
          user_id: DEMO_USER_ID,
          created_at: new Date(),
          updated_at: new Date(),
        }))

        await trx('transactions').insert(transactionRecords)
      }

      // 4. Insert budgets
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

      // 5. Insert savings pots
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
}

export async function down(knex) {
  // Remove all demo user data in reverse order of creation
  await knex('pots').where({ user_id: DEMO_USER_ID }).del()
  await knex('budgets').where({ user_id: DEMO_USER_ID }).del()
  await knex('transactions').where({ user_id: DEMO_USER_ID }).del()
  await knex('balance').where({ user_id: DEMO_USER_ID }).del()
  await knex('login_history').where({ user_id: DEMO_USER_ID }).del()
  await knex('refresh_tokens').where({ user_id: DEMO_USER_ID }).del()
  await knex('users').where({ id: DEMO_USER_ID }).del()
}
