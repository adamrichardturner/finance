import { Transaction as DbTransaction } from '~/repositories/finance.repository'

export interface AppTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: string
  category: string
  avatar?: string
  recurring?: boolean
}

/**
 * Transform transaction data from the database format to our application format
 */
export function transformDbTransaction(
  transaction: DbTransaction
): AppTransaction {
  return {
    id:
      transaction.id?.toString() || Math.random().toString(36).substring(2, 9),
    date: new Date(transaction.date).toISOString().slice(0, 10),
    description: transaction.name,
    amount: transaction.amount,
    type: transaction.amount > 0 ? 'income' : 'expense',
    category: transaction.category,
    avatar: transaction.avatar,
    recurring: transaction.recurring,
  }
}
