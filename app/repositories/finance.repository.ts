import db from '~/lib/db.server'

// Types to match the database schema
export interface Balance {
  id?: number
  current: number
  income: number
  expenses: number
}

export interface Transaction {
  id?: number
  avatar: string
  name: string
  category: string
  date: string
  amount: number
  recurring: boolean
  dueDay?: number
  isPaid?: boolean
  isOverdue?: boolean
  user_id?: string
}

export interface Budget {
  id?: number
  category: string
  maximum: number
  theme: string
  user_id?: string
}

export interface Pot {
  id?: number
  name: string
  target: number
  total: number
  theme: string
  user_id?: string
}

/**
 * Get all financial data for a user by user ID
 */
export async function getFinancialDataByUserId(userId: string) {
  try {
    // Get balance data
    const balance = await db('balance').where({ user_id: userId }).first()

    // Get transactions with pagination
    const transactions = await db('transactions')
      .where({ user_id: userId })
      .orderBy('date', 'desc')
      .limit(30)

    // Get budgets
    const budgets = await db('budgets').where({ user_id: userId })

    // Get pots
    const pots = await db('pots').where({ user_id: userId })

    return {
      balance: balance || { current: 0, income: 0, expenses: 0 },
      transactions,
      budgets,
      pots,
    }
  } catch (error) {
    console.error('Error getting financial data:', error)
    return {
      balance: { current: 0, income: 0, expenses: 0 },
      transactions: [],
      budgets: [],
      pots: [],
    }
  }
}
