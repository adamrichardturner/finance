import { useState, useMemo, useCallback } from 'react'
import { AppTransaction } from '~/utils/transform-data'

export interface TransactionPaginationProps {
  transactions: AppTransaction[]
  itemsPerPage?: number
}

export interface TransactionPaginationResult {
  visibleTransactions: AppTransaction[]
  loadMore: () => void
  hasMore: boolean
  page: number
  resetPagination: () => void
}

/**
 * Hook for paginating transaction data
 */
export function useTransactionPagination({
  transactions,
  itemsPerPage = 15,
}: TransactionPaginationProps): TransactionPaginationResult {
  const [page, setPage] = useState<number>(1)

  // Reset pagination when transaction source changes
  const resetPagination = useCallback(() => {
    setPage(1)
  }, [])

  // Get the transactions for the current page
  const visibleTransactions = useMemo(() => {
    return transactions.slice(0, page * itemsPerPage)
  }, [transactions, page, itemsPerPage])

  // Determine if there are more transactions to load
  const hasMore = useMemo(() => {
    return visibleTransactions.length < transactions.length
  }, [visibleTransactions, transactions])

  // Load more transactions
  const loadMore = useCallback(() => {
    if (visibleTransactions.length < transactions.length) {
      setPage((prev) => prev + 1)
    }
  }, [visibleTransactions.length, transactions.length])

  return {
    visibleTransactions,
    loadMore,
    hasMore,
    page,
    resetPagination,
  }
}
