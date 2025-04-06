import db from '~/lib/db.server'
import {
  Balance,
  Budget,
  FinancialData,
  Pot,
  Transaction,
  Bill,
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

    const budgets = await db<Budget>('budgets')
      .select('budgets.*')
      .orderBy('budgets.category', 'asc')

    for (const budget of budgets) {
      const budgetTransactions = await db<Transaction>('transactions')
        .select('*')
        .where('budget_id', budget.id)
        .orderBy('date', 'desc')

      budget.transactions = budgetTransactions
    }

    const pots = await db<Pot>('pots').select('*')

    const bills = await db<Bill>('bills').select('*').orderBy('date', 'desc')

    return {
      balance: balance || { current: 0, income: 0, expenses: 0 },
      transactions: transactions || [],
      budgets: budgets || [],
      pots: pots || [],
      bills: bills || [],
    }
  } catch (error) {
    console.error('Error accessing database, falling back to JSON file:', error)
    return getDataFromJsonFile()
  }
}

export async function getPots(userId: string): Promise<Pot[]> {
  try {
    const pots = await db('pots').select('*').where('user_id', userId)
    return pots
  } catch (error) {
    console.error('Error fetching pots:', error)

    const data = await getDataFromJsonFile()
    return data.pots || []
  }
}

export async function createPot({
  userId,
  name,
  target,
  theme,
  initialAmount = 0,
}: {
  userId: string
  name: string
  target: number
  theme: string
  initialAmount?: number
}): Promise<Pot> {
  const existingPot = await db('pots')
    .where('user_id', userId)
    .where('name', name)
    .first()

  if (existingPot) {
    throw new Error(`A pot with the name "${name}" already exists`)
  }

  // Check if initialAmount is valid
  const numInitialAmount = Number(initialAmount || 0)

  // If user is adding initial funds, check if they have enough balance
  if (numInitialAmount > 0) {
    const userBalance = await db('balance').where('user_id', userId).first()

    if (!userBalance || userBalance.current < numInitialAmount) {
      throw new Error(
        `Cannot add more than your available balance of ${userBalance ? userBalance.current : 0}`
      )
    }
  }

  return db.transaction(async (trx) => {
    // Create the pot with the initial amount
    const [pot] = await trx('pots')
      .insert({
        user_id: userId,
        name,
        target,
        total: numInitialAmount,
        theme,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')

    // If initial amount is provided, update the user's balance
    if (numInitialAmount > 0) {
      // Update the user's balance by subtracting the initial amount
      await trx('balance')
        .where('user_id', userId)
        .update({
          current: trx.raw('current - ?', [numInitialAmount]),
          updated_at: new Date().toISOString(),
        })

      // Add a transaction record for the initial funds
      const now = new Date()
      const transactionData = {
        avatar: '/assets/icons/savings.svg',
        name: `Initial funds for ${name} Savings Pot`,
        category: 'Savings',
        date: now,
        amount: -numInitialAmount, // Negative amount since it's being deducted from balance
        recurring: false,
        user_id: userId,
        created_at: now,
        updated_at: now,
      }

      await trx('transactions').insert(transactionData)
    }

    return pot
  })
}

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
  const existingPot = await db('pots')
    .where('id', id)
    .where('user_id', userId)
    .first()

  if (!existingPot) {
    throw new Error('Pot not found')
  }

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

export async function deletePot({
  id,
  userId,
}: {
  id: number
  userId: string
}): Promise<void> {
  const pot = await db('pots').where('id', id).where('user_id', userId).first()

  if (!pot) {
    throw new Error('Pot not found')
  }

  // Check if the pot has any balance to return to the main account
  const potTotal = Number(pot.total || 0)

  return db.transaction(async (trx) => {
    // Delete the pot
    await trx('pots').where('id', id).where('user_id', userId).delete()

    // If the pot had a balance, return it to the main account
    if (potTotal > 0) {
      // Update the user's balance by adding the pot total
      await trx('balance')
        .where('user_id', userId)
        .update({
          current: trx.raw('current + ?', [potTotal]),
          updated_at: new Date().toISOString(),
        })

      // Add a transaction record for the returned funds
      const now = new Date()
      const transactionData = {
        avatar: '/assets/icons/withdraw.svg',
        name: `Returned funds from deleted ${pot.name} Savings Pot`,
        category: 'Return',
        date: now,
        amount: potTotal, // Positive amount since it's going back to main balance
        recurring: false,
        user_id: userId,
        created_at: now,
        updated_at: now,
      }

      await trx('transactions').insert(transactionData)
    }
  })
}

export async function updatePotBalance({
  id,
  userId,
  amount,
}: {
  id: number
  userId: string
  amount: number
}): Promise<Pot> {
  const numAmount = Number(amount)

  const pot = await db('pots').where('id', id).where('user_id', userId).first()

  if (!pot) {
    throw new Error('Pot not found')
  }

  // If adding money to the pot, check if user has enough balance
  if (numAmount > 0) {
    const userBalance = await db('balance').where('user_id', userId).first()

    if (!userBalance || userBalance.current < numAmount) {
      throw new Error(
        `Cannot add more than your available balance of ${userBalance ? userBalance.current : 0}`
      )
    }
  }

  const currentTotal = Number(pot.total || 0)

  const newTotal = Math.round((currentTotal + numAmount) * 100) / 100

  if (newTotal < 0) {
    throw new Error('Cannot withdraw more than the current balance')
  }

  return db.transaction(async (trx) => {
    const [updatedPot] = await trx('pots')
      .where('id', id)
      .where('user_id', userId)
      .update({
        total: newTotal,
        updated_at: new Date().toISOString(),
      })
      .returning('*')

    await trx('balance')
      .where('user_id', userId)
      .update({
        current: trx.raw('current - ?', [numAmount]),
        updated_at: new Date().toISOString(),
      })

    const now = new Date()
    const isAddingToPot = numAmount > 0

    const transactionData = {
      avatar: isAddingToPot
        ? '/assets/icons/savings.svg'
        : '/assets/icons/withdraw.svg',
      name: isAddingToPot
        ? `Transfer to ${pot.name} Savings Pot`
        : `Withdrawal from ${pot.name} Savings Pot`,
      category: isAddingToPot ? 'Savings' : 'Withdrawal',
      date: now,

      amount: -numAmount,
      recurring: false,
      user_id: userId,
      created_at: now,
      updated_at: now,
    }

    await trx('transactions').insert(transactionData)

    return updatedPot
  })
}
