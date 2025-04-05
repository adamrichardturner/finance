import { useTransactionsQuery } from './use-transactions-query'
import { AppTransaction } from '~/utils/transform-data'

export interface TransactionBaseResult {
  transactions: AppTransaction[] | undefined
  isLoading: boolean
  error: unknown
  categories: string[]
}

/**
 * Base hook for fetching transaction data
 */
export function useTransactionBase(): TransactionBaseResult {
  const { data: transactions, isLoading, error } = useTransactionsQuery()

  const categories = transactions ? extractUniqueCategories(transactions) : []

  return {
    transactions,
    isLoading,
    error,
    categories,
  }
}

/**
 * Extracts and formats unique categories from transactions
 */
function extractUniqueCategories(transactions: AppTransaction[]): string[] {
  const allCategories = transactions.map(
    (tx: AppTransaction) =>
      tx.category.charAt(0).toUpperCase() + tx.category.slice(1).toLowerCase()
  )

  const uniqueCategories: string[] = allCategories.filter(
    (category: string, index: number, self: string[]) =>
      self.indexOf(category) === index
  )

  uniqueCategories.sort((a, b) => a.localeCompare(b))

  return ['All Transactions', ...uniqueCategories]
}
