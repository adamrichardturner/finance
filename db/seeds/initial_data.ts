import { Knex } from 'knex'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

export async function seed(knex: Knex): Promise<void> {
  // Get directory path in ESM
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  // Read data from JSON file
  const dataPath = path.resolve(__dirname, '../../app/lib/data.json')
  const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  // Clear existing tables
  await knex('pots').del()
  await knex('budgets').del()
  await knex('transactions').del()
  await knex('balance').del()

  // Insert balance data
  await knex('balance').insert({
    current: jsonData.balance.current,
    income: jsonData.balance.income,
    expenses: jsonData.balance.expenses,
  })

  // Insert transaction data
  await knex('transactions').insert(
    jsonData.transactions.map((transaction: any) => ({
      ...transaction,
      date: new Date(transaction.date),
    }))
  )

  // Insert budget data
  await knex('budgets').insert(jsonData.budgets)

  // Insert pot data
  await knex('pots').insert(jsonData.pots)
}
