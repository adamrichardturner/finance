import { useMemo, useState } from 'react'
import { AppTransaction } from '~/utils/transform-data'
import { SortOption, SortStrategyFactory } from '~/strategies/transactions'

export interface TransactionSortingProps {
  transactions: AppTransaction[]
}

export interface TransactionSortingResult {
  sortBy: SortOption
  setSortBy: (sortOption: SortOption) => void
  sortedTransactions: AppTransaction[]
  availableSortOptions: Array<{
    value: SortOption
    label: string
  }>
}

/**
 * Hook for sorting transaction data using the Strategy pattern
 */
export function useTransactionSorting({
  transactions,
}: TransactionSortingProps): TransactionSortingResult {
  const [sortBy, setSortBy] = useState<SortOption>('latest')

  // Get all available sort strategies
  const availableSortOptions = useMemo(() => {
    return SortStrategyFactory.getAllStrategies().map((strategy) => ({
      value: strategy.sortOption,
      label: strategy.displayName,
    }))
  }, [])

  // Apply the selected sort strategy to transactions
  const sortedTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return []
    }

    // Get the appropriate sort strategy based on the selected option
    const sortStrategy = SortStrategyFactory.getStrategy(sortBy)

    // Execute the strategy on the transactions
    return sortStrategy.execute(transactions)
  }, [transactions, sortBy])

  return {
    sortBy,
    setSortBy,
    sortedTransactions,
    availableSortOptions,
  }
}
