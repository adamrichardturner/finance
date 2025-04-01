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
