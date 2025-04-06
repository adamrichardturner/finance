import { useTransactionBase } from './use-transaction-base'
import { useTransactionFilters } from './use-transaction-filters'
import { useTransactionSorting } from './use-transaction-sorting'
import { useTransactionPagination } from './use-transaction-pagination'
import { useTransactionFormatting } from './use-transaction-formatting'
import { useTransactionNavigation } from './use-transaction-navigation'
import { useTransactionGrouping } from './use-transaction-grouping'
import { AppTransaction } from '~/utils/transform-data'
import { useEffect } from 'react'
import {
  SortOption,
  TransactionFilterStrategy,
} from '~/strategies/transactions'
import { useQueryClient } from '@tanstack/react-query'

export interface UseTransactionsResult {
  // Data and loading state
  isLoading: boolean
  error: unknown
  transactions: AppTransaction[] | undefined
  categories: string[]
  refreshTransactions: () => Promise<boolean>

  // Filtering state
  searchQuery: string
  setSearchQuery: (query: string) => void
  debouncedSearchQuery: string
  category: string
  setCategory: (category: string) => void
  activeFilters: TransactionFilterStrategy[]
  addFilter: (filter: TransactionFilterStrategy) => void
  removeFilter: (filterName: string) => void
  clearFilters: () => void
  clearSearch: () => void

  // Sorting state
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
  availableSortOptions: Array<{
    value: SortOption
    label: string
  }>

  // Grouping state
  groupBy: string | null
  setGroupBy: (groupOption: string | null) => void
  groupedTransactions: Record<string, AppTransaction[]> | null
  availableGroupOptions: Array<{
    value: string
    label: string
  }>
  isGrouped: boolean

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
 * using the Strategy pattern for data operations
 */
export function useTransactions(): UseTransactionsResult {
  // Base data fetching
  const { transactions, isLoading, error, categories } = useTransactionBase()
  const queryClient = useQueryClient()

  // Filtering logic
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    category,
    setCategory,
    clearUrlSearch,
    filteredTransactions,
    filteredCount,
    activeFilters,
    addFilter,
    removeFilter,
    clearFilters,
  } = useTransactionFilters({
    transactions,
  })

  // Sorting logic
  const { sortBy, setSortBy, sortedTransactions, availableSortOptions } =
    useTransactionSorting({
      transactions: filteredTransactions,
    })

  // Grouping logic
  const {
    groupBy,
    setGroupBy,
    groupedTransactions,
    availableGroupOptions,
    isGrouped,
  } = useTransactionGrouping({
    transactions: sortedTransactions,
  })

  // Pagination logic
  const { visibleTransactions, loadMore, hasMore, resetPagination } =
    useTransactionPagination({
      // If we're grouping, we'll handle pagination differently
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
    clearUrlSearch,
  })

  // Simple function to clear search
  const clearSearch = () => {
    clearUrlSearch() // This already clears the search query and updates the URL
  }

  // Reset pagination when filter, sort, or group changes
  useEffect(() => {
    resetPagination()
  }, [category, debouncedSearchQuery, sortBy, groupBy, resetPagination])

  // Add refreshTransactions implementation
  const refreshTransactions = async (): Promise<boolean> => {
    try {
      // Reset pagination first
      resetPagination()

      // Then invalidate the relevant queries to force a refresh
      await queryClient.invalidateQueries({ queryKey: ['transactions'] })
      await queryClient.invalidateQueries({ queryKey: ['financialData'] })

      console.log('Transactions refreshed successfully')
      return true
    } catch (error) {
      console.error('Error refreshing transactions:', error)
      return false
    }
  }

  return {
    // Data and loading state
    isLoading,
    error,
    transactions,
    categories,
    refreshTransactions,

    // Filtering state
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    category,
    setCategory,
    activeFilters,
    addFilter,
    removeFilter,
    clearFilters,
    clearSearch,

    // Sorting state
    sortBy,
    setSortBy,
    availableSortOptions,

    // Grouping state
    groupBy,
    setGroupBy,
    groupedTransactions,
    availableGroupOptions,
    isGrouped,

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
  useTransactionGrouping,
  useTransactionPagination,
  useTransactionFormatting,
  useTransactionNavigation,
}
