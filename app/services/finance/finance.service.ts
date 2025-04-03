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

    // Get budgets with their associated transactions
    const budgets = await db<Budget>('budgets')
      .select('budgets.*')
      .orderBy('budgets.category', 'asc')

    // For each budget, get its transactions
    for (const budget of budgets) {
      const budgetTransactions = await db<Transaction>('transactions')
        .select('*')
        .where('budget_id', budget.id)
        .orderBy('date', 'desc')

      budget.transactions = budgetTransactions
    }

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

/**
 * Get all pots for a specific user
 */
export async function getPots(userId: string): Promise<Pot[]> {
  try {
    // Fetch pots from the database for the specific user
    const pots = await db('pots').select('*').where('user_id', userId)
    return pots
  } catch (error) {
    console.error('Error fetching pots:', error)
    // If database query fails, try to get data from the JSON file
    const data = await getDataFromJsonFile()
    return data.pots || []
  }
}

/**
 * Create a new pot for a user
 */
export async function createPot({
  userId,
  name,
  target,
  theme,
}: {
  userId: string
  name: string
  target: number
  theme: string
}): Promise<Pot> {
  // Check if pot with same name already exists for this user
  const existingPot = await db('pots')
    .where('user_id', userId)
    .where('name', name)
    .first()

  if (existingPot) {
    throw new Error(`A pot with the name "${name}" already exists`)
  }

  const [pot] = await db('pots')
    .insert({
      user_id: userId,
      name,
      target,
      total: 0, // Start with zero savings
      theme,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returning('*')

  return pot
}

/**
 * Update an existing pot
 */
export async function updatePot({
  id,
  userId,
  name,
  target,
  theme,
}: {
  id: number
  userId: string
  name: string
  target: number
  theme: string
}): Promise<Pot> {
  // Check if pot exists
  const existingPot = await db('pots')
    .where('id', id)
    .where('user_id', userId)
    .first()

  if (!existingPot) {
    throw new Error('Pot not found')
  }

  // Check if another pot with the same name exists (excluding this one)
  if (name !== existingPot.name) {
    const duplicatePot = await db('pots')
      .where('user_id', userId)
      .where('name', name)
      .whereNot('id', id)
      .first()

    if (duplicatePot) {
      throw new Error(`A pot with the name "${name}" already exists`)
    }
  }

  const [updatedPot] = await db('pots')
    .where('id', id)
    .where('user_id', userId)
    .update({
      name,
      target,
      theme,
      updated_at: new Date().toISOString(),
    })
    .returning('*')

  return updatedPot
}

/**
 * Delete a pot
 */
export async function deletePot({
  id,
  userId,
}: {
  id: number
  userId: string
}): Promise<void> {
  // Check if pot exists
  const pot = await db('pots').where('id', id).where('user_id', userId).first()

  if (!pot) {
    throw new Error('Pot not found')
  }

  await db('pots').where('id', id).where('user_id', userId).delete()
}

/**
 * Update pot balance (add or remove money)
 */
export async function updatePotBalance({
  id,
  userId,
  amount,
}: {
  id: number
  userId: string
  amount: number // Positive for adding, negative for withdrawing
}): Promise<Pot> {
  console.log('updatePotBalance called with:', {
    id,
    userId,
    amount,
    amountType: typeof amount,
  })

  // Ensure amount is a proper number
  const numAmount = Number(amount)

  // Check if pot exists
  const pot = await db('pots').where('id', id).where('user_id', userId).first()

  if (!pot) {
    throw new Error('Pot not found')
  }

  console.log('Existing pot type:', typeof pot.total, 'value:', pot.total)

  // Ensure pot.total is a number
  const currentTotal = Number(pot.total || 0)

  // Calculate new total (rounded to 2 decimal places)
  const newTotal = Math.round((currentTotal + numAmount) * 100) / 100

  console.log('Calculated new total:', {
    existingTotal: currentTotal,
    amountToAdd: numAmount,
    newTotal,
  })

  // Validate that withdrawal doesn't exceed current total
  if (newTotal < 0) {
    throw new Error('Cannot withdraw more than the current balance')
  }

  // Use a transaction to ensure both updates succeed or fail together
  return db.transaction(async (trx) => {
    // 1. Update the pot balance
    const [updatedPot] = await trx('pots')
      .where('id', id)
      .where('user_id', userId)
      .update({
        total: newTotal,
        updated_at: new Date().toISOString(),
      })
      .returning('*')

    console.log('Updated pot in transaction:', updatedPot)

    // 2. Update the main account balance
    // When adding money to pot (positive amount), decrease main balance
    // When withdrawing from pot (negative amount), increase main balance
    await trx('balance')
      .where('user_id', userId)
      .update({
        // Use negative amount to adjust balance correctly
        // When numAmount is positive (adding to pot), balance decreases
        // When numAmount is negative (withdrawing from pot), balance increases
        current: trx.raw('current - ?', [numAmount]),
        updated_at: new Date().toISOString(),
      })

    // 3. Create a transaction record for this movement
    const now = new Date()
    const isAddingToPot = numAmount > 0

    // Format the transaction based on whether we're adding or withdrawing
    const transactionData = {
      avatar: isAddingToPot
        ? '/assets/icons/savings.svg'
        : '/assets/icons/withdraw.svg',
      name: isAddingToPot
        ? `Transfer to ${pot.name} Savings Pot`
        : `Withdrawal from ${pot.name} Savings Pot`,
      category: 'Savings',
      date: now,
      // For pot transfers, we negate the amount in the transaction record
      // since adding to pot is reducing main balance (negative amount)
      // and withdrawing from pot is increasing main balance (positive amount)
      amount: -numAmount,
      recurring: false,
      user_id: userId,
      created_at: now,
      updated_at: now,
    }

    await trx('transactions').insert(transactionData)
    console.log('Created transaction for pot movement:', transactionData)

    return updatedPot
  })
}
