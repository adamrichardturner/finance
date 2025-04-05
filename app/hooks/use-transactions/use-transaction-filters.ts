import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from '@remix-run/react'
import { AppTransaction } from '~/utils/transform-data'
import { useDebounce } from '~/hooks/use-debounce'
import {
  FilterStrategyFactory,
  TransactionFilterStrategy,
} from '~/strategies/transactions'

export interface TransactionFiltersProps {
  transactions?: AppTransaction[]
}

export interface TransactionFiltersResult {
  // Search state
  searchQuery: string
  setSearchQuery: (query: string) => void
  debouncedSearchQuery: string

  // Category state
  category: string
  setCategory: (category: string) => void

  // URL sync - simplified
  updateUrlParams: () => void
  clearUrlSearch: () => void

  // Filter results
  filteredTransactions: AppTransaction[]
  filteredCount: number

  // Active filters
  activeFilters: TransactionFilterStrategy[]
  addFilter: (filter: TransactionFilterStrategy) => void
  removeFilter: (filterName: string) => void
  clearFilters: () => void
}

/**
 * Hook for filtering transaction data using the Strategy pattern
 */
export function useTransactionFilters({
  transactions = [],
}: TransactionFiltersProps): TransactionFiltersResult {
  // State for text search
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // State for category filtering
  const [category, setCategory] = useState('all')

  // State for active filters
  const [activeFilters, setActiveFilters] = useState<
    TransactionFilterStrategy[]
  >([])

  // URL integration - simplified
  const [, setSearchParams] = useSearchParams()

  // Update URL when category or search changes
  useEffect(() => {
    // Build URL params based on current state
    const params = new URLSearchParams()

    // Add category if not "all"
    if (category !== 'all') {
      params.set('category', category.toLowerCase())
    }

    // Add search query if present
    if (searchQuery) {
      params.set('search', searchQuery)
    }

    // Update URL with new params
    setSearchParams(params, { replace: true })
  }, [category, debouncedSearchQuery, searchQuery, setSearchParams])

  // Simple function to clear search from URL
  const clearUrlSearch = useCallback(() => {
    setSearchQuery('')
    // URL will be updated by the effect above
  }, [])

  // Add a filter to active filters
  const addFilter = useCallback((filter: TransactionFilterStrategy) => {
    setActiveFilters((current) => {
      // Don't add duplicate filters
      if (current.some((f) => f.filterName === filter.filterName)) {
        return current
      }
      return [...current, filter]
    })
  }, [])

  // Remove a filter by name
  const removeFilter = useCallback((filterName: string) => {
    setActiveFilters((current) =>
      current.filter((f) => f.filterName !== filterName)
    )
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveFilters([])
    setCategory('all')
    setSearchQuery('')
    clearUrlSearch()
  }, [setActiveFilters, setCategory, setSearchQuery, clearUrlSearch])

  // Update active filters based on search query and category
  useEffect(() => {
    // Remove any existing search filters
    setActiveFilters((current) =>
      current.filter((f) => !f.filterName.startsWith('search:'))
    )

    // Add search filter if we have a search query
    if (debouncedSearchQuery) {
      addFilter(FilterStrategyFactory.createSearchFilter(debouncedSearchQuery))
    }
  }, [debouncedSearchQuery, addFilter])

  // Update active filters based on category
  useEffect(() => {
    // Remove any existing category filters
    setActiveFilters((current) =>
      current.filter((f) => !f.filterName.startsWith('category:'))
    )

    // Add category filter if not "all"
    if (category !== 'all') {
      addFilter(FilterStrategyFactory.createCategoryFilter(category))
    }
  }, [category, addFilter])

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return []
    }

    if (activeFilters.length === 0) {
      return transactions
    }

    // Create a composite filter from all active filters
    const compositeFilter =
      FilterStrategyFactory.createCompositeFilter(activeFilters)

    // Apply the filter to transactions
    return compositeFilter.execute(transactions)
  }, [transactions, activeFilters])

  return {
    // Search state
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,

    // Category state
    category,
    setCategory,

    // URL sync - simplified
    updateUrlParams: clearUrlSearch,
    clearUrlSearch,

    // Filter results
    filteredTransactions,
    filteredCount: filteredTransactions.length,

    // Active filters
    activeFilters,
    addFilter,
    removeFilter,
    clearFilters,
  }
}
