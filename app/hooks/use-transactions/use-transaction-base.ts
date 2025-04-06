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
  // Make sure special pot transaction categories like 'Savings', 'Withdrawal', 'Return' are always included
  const specialPotCategories = ['Savings', 'Withdrawal', 'Return']

  const allCategories = transactions.map((tx: AppTransaction) => {
    const category =
      tx.category.charAt(0).toUpperCase() + tx.category.slice(1).toLowerCase()

    // Check if this is a pot-related transaction based on description
    const description = tx.description.toLowerCase()

    // Check for Savings pot transactions
    if (
      (description.includes('savings pot') ||
        description.includes('transfer to pot') ||
        description.includes('adding to pot')) &&
      !specialPotCategories.includes(category)
    ) {
      return 'Savings'
    }

    // Check for Withdrawal transactions
    if (
      (description.includes('withdrawal from') ||
        description.includes('pot withdrawal')) &&
      !specialPotCategories.includes(category)
    ) {
      return 'Withdrawal'
    }

    // Check for Return transactions
    if (
      (description.includes('returned funds') ||
        description.includes('pot balance returned') ||
        description.includes('deleted pot')) &&
      !specialPotCategories.includes(category)
    ) {
      return 'Return'
    }

    return category
  })

  const uniqueCategories: string[] = allCategories.filter(
    (category: string, index: number, self: string[]) =>
      self.indexOf(category) === index
  )

  uniqueCategories.sort((a, b) => a.localeCompare(b))

  // Ensure pot categories are included even if no transactions exist for them yet
  specialPotCategories.forEach((category) => {
    if (!uniqueCategories.includes(category)) {
      uniqueCategories.push(category)
    }
  })

  // Re-sort to maintain alphabetical order
  uniqueCategories.sort((a, b) => a.localeCompare(b))

  return ['All Transactions', ...uniqueCategories]
}
