import db from '~/lib/db.server'
import {
  Balance,
  Budget,
  FinancialData,
  Pot,
  Transaction,
} from '~/types/finance.types'
import fs from 'fs'
import path from 'path'

async function getDataFromJsonFile(): Promise<FinancialData> {
  try {
    const dataPath = path.resolve(process.cwd(), 'public/data.json')
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    return jsonData as FinancialData
  } catch (error) {
    console.error('Error reading from JSON file:', error)
    throw new Error('Failed to read financial data from JSON file')
  }
}

export async function getFinancialData(): Promise<FinancialData> {
  try {
    const balance = await db<Balance>('balance')
      .select('current', 'income', 'expenses')
      .first()

    const transactions = await db<Transaction>('transactions')
      .select('*')
      .orderBy('date', 'desc')

    const budgets = await db<Budget>('budgets').select('*')

    const pots = await db<Pot>('pots').select('*')

    return {
      balance: balance || { current: 0, income: 0, expenses: 0 },
      transactions: transactions || [],
      budgets: budgets || [],
      pots: pots || [],
    }
  } catch (error) {
    console.error('Error accessing database, falling back to JSON file:', error)
    return getDataFromJsonFile()
  }
}
