import { Knex } from 'knex'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const DEMO_USER_ID = process.env.DEMO_USER_ID
const DEMO_PASSWORD_HASH = process.env.DEMO_PASSWORD_HASH

export async function seed(knex: Knex): Promise<void> {
  console.log('Seeding demo user data from data.json...')

  // Get directory path in ESM
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  // Check if demo user data already exists

  const existingBalance = await knex('balance')
    .where({ user_id: DEMO_USER_ID })
    .first()

  if (existingBalance) {
    console.log('Demo user data already exists. Skipping seed.')
    return
  }

  // Read data from JSON file
  const dataPath = path.resolve(__dirname, '../../app/lib/data.json')
  const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  // Clear existing demo user data if it exists
  await knex('pots').where({ user_id: DEMO_USER_ID }).del()
  await knex('budgets').where({ user_id: DEMO_USER_ID }).del()
  await knex('transactions').where({ user_id: DEMO_USER_ID }).del()
  await knex('balance').where({ user_id: DEMO_USER_ID }).del()

  // First make sure demo user exists
  const demoUser = await knex('users').where({ id: DEMO_USER_ID }).first()

  if (!demoUser) {
    console.log('Creating demo user...')

    // Get password hash from environment variable

    if (!DEMO_PASSWORD_HASH) {
      throw new Error(
        'DEMO_PASSWORD_HASH environment variable is required but not set'
      )
    }

    console.log(`Creating demo user with ID: ${DEMO_USER_ID}`)

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
  }

  // Insert balance data
  await knex('balance').insert({
    current: jsonData.balance.current,
    income: jsonData.balance.income,
    expenses: jsonData.balance.expenses,
    user_id: DEMO_USER_ID,
  })

  // Insert transaction data
  await knex('transactions').insert(
    jsonData.transactions.map((transaction: any) => ({
      ...transaction,
      date: new Date(transaction.date),
      user_id: DEMO_USER_ID,
    }))
  )

  // Insert budget data if it exists
  if (jsonData.budgets && Array.isArray(jsonData.budgets)) {
    await knex('budgets').insert(
      jsonData.budgets.map((budget: any) => ({
        ...budget,
        user_id: DEMO_USER_ID,
      }))
    )
  }

  // Insert pot data if it exists
  if (jsonData.pots && Array.isArray(jsonData.pots)) {
    await knex('pots').insert(
      jsonData.pots.map((pot: any) => ({
        ...pot,
        user_id: DEMO_USER_ID,
      }))
    )
  }

  console.log('Demo user data seeded successfully!')
}
