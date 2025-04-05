import { useTransactionBase } from './use-transaction-base'
import { useTransactionFilters } from './use-transaction-filters'
import { useTransactionSorting } from './use-transaction-sorting'
import { useTransactionPagination } from './use-transaction-pagination'
import { useTransactionFormatting } from './use-transaction-formatting'
import { useTransactionNavigation } from './use-transaction-navigation'
import { AppTransaction } from '~/utils/transform-data'
import { useEffect } from 'react'
import { SortOption } from './use-transaction-sorting'

export interface UseTransactionsResult {
  // Data and loading state
  isLoading: boolean
  error: unknown
  transactions: AppTransaction[] | undefined
  categories: string[]

  // Filtering state
  searchQuery: string
  setSearchQuery: (query: string) => void
  debouncedSearchQuery: string
  category: string
  setCategory: (category: string) => void

  // Sorting state
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void

  // Results
  visibleTransactions: AppTransaction[]
  filteredCount: number
  loadMore: () => void
  hasMore: boolean

  // Formatting
  formatCurrency: (amount: number) => string
  formatTransactionDate: (dateString: string) => string
  isOverAMonthOld: (dateString: string) => boolean
  renderTransactionAvatar: (transaction: AppTransaction) => JSX.Element

  // Navigation
  handleCategoryClick: (categoryName: string) => void
  handleSenderClick: (senderName: string) => void
}

/**
 * Main transactions hook that composes all specialized hooks
 */
export function useTransactions(): UseTransactionsResult {
  // Base data fetching
  const { transactions, isLoading, error, categories } = useTransactionBase()

  // Filtering logic
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    category,
    setCategory,
    urlSearchQuery,
    setUrlSearchQuery,
    filteredTransactions,
    filteredCount,
  } = useTransactionFilters({
    transactions,
  })

  // Sorting logic
  const { sortBy, setSortBy, sortedTransactions } = useTransactionSorting({
    transactions: filteredTransactions,
  })

  // Pagination logic
  const { visibleTransactions, loadMore, hasMore, page, resetPagination } =
    useTransactionPagination({
      transactions: sortedTransactions,
    })

  // Formatting utilities
  const {
    formatCurrency,
    formatTransactionDate,
    isOverAMonthOld,
    renderTransactionAvatar,
  } = useTransactionFormatting()

  // URL and navigation
  const { handleCategoryClick, handleSenderClick } = useTransactionNavigation({
    setCategory,
    setSearchQuery,
    setUrlSearchQuery,
  })

  // Reset pagination when filter or sort changes
  useEffect(() => {
    resetPagination()
  }, [category, debouncedSearchQuery, urlSearchQuery, sortBy, resetPagination])

  return {
    // Data and loading state
    isLoading,
    error,
    transactions,
    categories,

    // Filtering state
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    category,
    setCategory,

    // Sorting state
    sortBy,
    setSortBy,

    // Results
    visibleTransactions,
    filteredCount,
    loadMore,
    hasMore,

    // Formatting
    formatCurrency,
    formatTransactionDate,
    isOverAMonthOld,
    renderTransactionAvatar,

    // Navigation
    handleCategoryClick,
    handleSenderClick,
  }
}

// Re-export all hooks for direct use if needed
export {
  useTransactionBase,
  useTransactionFilters,
  useTransactionSorting,
  useTransactionPagination,
  useTransactionFormatting,
  useTransactionNavigation,
}
