import db from '~/lib/db.server'
import { Budget } from '~/types/finance.types'

interface CreateBudgetParams {
  userId: string
  category: string
  maxAmount: number
  theme: string
}

interface UpdateBudgetParams {
  id: number
  userId: string
  category: string
  maxAmount: number
}

interface DeleteBudgetParams {
  id: number
  userId: string
}

export async function getBudgets(userId: string): Promise<Budget[]> {
  // First get all budgets
  const budgets = await db('budgets')
    .where({ user_id: userId })
    .orderBy('created_at', 'desc')
    .select('*')

  // Get all transactions for these budget categories
  const transactions = await db('transactions')
    .where({ user_id: userId })
    .whereIn(
      'category',
      budgets.map((b) => b.category)
    )
    .orderBy('date', 'desc')
    .select('*')

  // Group transactions by category
  const transactionsByCategory = transactions.reduce(
    (acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = []
      }
      acc[transaction.category].push(transaction)
      return acc
    },
    {} as Record<string, any[]>
  )

  // Map budgets with their transactions
  return budgets.map((budget) => ({
    id: budget.id,
    user_id: budget.user_id,
    category: budget.category,
    maximum: budget.maximum,
    theme: budget.theme,
    transactions: transactionsByCategory[budget.category] || [],
  }))
}

export async function createBudget({
  userId,
  category,
  maxAmount,
  theme,
}: CreateBudgetParams): Promise<Budget> {
  const budget = await db('budgets')
    .insert({
      user_id: userId,
      category,
      maximum: maxAmount,
      theme,
    })
    .returning('*')

  return {
    id: budget[0].id,
    user_id: budget[0].user_id,
    category: budget[0].category,
    maximum: budget[0].maximum,
    theme: budget[0].theme,
    transactions: [],
  }
}

export async function updateBudget({
  id,
  userId,
  category,
  maxAmount,
}: UpdateBudgetParams): Promise<Budget> {
  const budget = await db('budgets')
    .where({ id, user_id: userId })
    .update({
      category,
      maximum: maxAmount,
    })
    .returning('*')

  return {
    id: budget[0].id,
    user_id: budget[0].user_id,
    category: budget[0].category,
    maximum: budget[0].maximum,
    theme: budget[0].theme,
    transactions: [],
  }
}

export async function deleteBudget({
  id,
  userId,
}: DeleteBudgetParams): Promise<void> {
  await db('budgets').where({ id, user_id: userId }).delete()
}
