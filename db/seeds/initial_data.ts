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
    console.log(
      'Demo user data exists. Clearing existing data before reseeding...'
    )
  }

  // Read data from JSON file
  const dataPath = path.resolve(__dirname, '../../app/lib/data.json')
  const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  // Clear existing demo user data
  await knex('pots').where({ user_id: DEMO_USER_ID }).del()
  await knex('transactions').where({ user_id: DEMO_USER_ID }).del()
  await knex('budgets').where({ user_id: DEMO_USER_ID }).del()
  await knex('categories').where({ user_id: DEMO_USER_ID }).del()
  await knex('balance').where({ user_id: DEMO_USER_ID }).del()

  // First make sure demo user exists
  const demoUser = await knex('users').where({ id: DEMO_USER_ID }).first()

  if (!demoUser) {
    console.log('Creating demo user...')

    if (!DEMO_PASSWORD_HASH) {
      throw new Error(
        'DEMO_PASSWORD_HASH environment variable is required but not set'
      )
    }

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

  // Insert categories and store their IDs
  const categoryMap = new Map<string, number>()

  if (jsonData.categories && Array.isArray(jsonData.categories)) {
    const categoryRows = await knex('categories')
      .insert(
        jsonData.categories.map((category: any) => ({
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
  const budgetMap = new Map<string, number>()
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
      const [budgetRow] = await knex('budgets')
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
        await knex('transactions').insert(transactionData)
      } catch (error) {
        console.error(`Error inserting transaction: ${transaction.name}`, error)
        console.error('Transaction data:', transactionData)
      }
    }
  }

  // Insert pot data
  if (jsonData.pots && Array.isArray(jsonData.pots)) {
    await knex('pots').insert(
      jsonData.pots.map((pot: any) => ({
        ...pot,
        user_id: DEMO_USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    )
  }

  console.log('Demo user data seeded successfully!')
}
