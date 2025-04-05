import { useMemo, useState } from 'react'
import { AppTransaction } from '~/utils/transform-data'
import orderBy from 'lodash/orderBy'

export type SortOption =
  | 'latest'
  | 'oldest'
  | 'a-z'
  | 'z-a'
  | 'highest'
  | 'lowest'

export interface TransactionSortingProps {
  transactions: AppTransaction[]
}

export interface TransactionSortingResult {
  sortBy: SortOption
  setSortBy: (sortOption: SortOption) => void
  sortedTransactions: AppTransaction[]
}

/**
 * Hook for sorting transaction data
 */
export function useTransactionSorting({
  transactions,
}: TransactionSortingProps): TransactionSortingResult {
  const [sortBy, setSortBy] = useState<SortOption>('latest')

  const sortedTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return []
    }

    switch (sortBy) {
      case 'latest':
        return orderBy(
          transactions,
          [(tx: AppTransaction) => new Date(tx.date).getTime()],
          ['desc']
        )
      case 'oldest':
        return orderBy(
          transactions,
          [(tx: AppTransaction) => new Date(tx.date).getTime()],
          ['asc']
        )
      case 'a-z':
        return orderBy(transactions, ['description'], ['asc'])
      case 'z-a':
        return orderBy(transactions, ['description'], ['desc'])
      case 'highest':
        return orderBy(
          transactions,
          [(tx: AppTransaction) => (tx.amount >= 0 ? 1 : 0), 'amount'],
          ['desc', 'desc']
        )
      case 'lowest':
        return orderBy(
          transactions,
          [(tx: AppTransaction) => (tx.amount < 0 ? 0 : 1), 'amount'],
          ['asc', 'asc']
        )
      default:
        return transactions
    }
  }, [transactions, sortBy])

  return {
    sortBy,
    setSortBy,
    sortedTransactions,
  }
}
