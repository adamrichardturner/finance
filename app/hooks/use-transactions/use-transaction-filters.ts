import { useMemo, useState, useCallback, useEffect } from 'react'
import { AppTransaction } from '~/utils/transform-data'
import debounce from 'lodash/debounce'
import filter from 'lodash/filter'

export interface TransactionFiltersProps {
  transactions: AppTransaction[] | undefined
}

export interface TransactionFiltersResult {
  searchQuery: string
  setSearchQuery: (query: string) => void
  debouncedSearchQuery: string
  category: string
  setCategory: (category: string) => void
  urlSearchQuery: string
  setUrlSearchQuery: (query: string) => void
  filteredTransactions: AppTransaction[]
  filteredCount: number
}

/**
 * Hook for managing transaction filtering
 */
export function useTransactionFilters({
  transactions,
}: TransactionFiltersProps): TransactionFiltersResult {
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [urlSearchQuery, setUrlSearchQuery] = useState<string>('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('')

  // Category filter
  const [category, setCategory] = useState<string>('all')

  // Setup debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchQuery(value)
    }, 200),
    []
  )

  // Update debounced search when input changes
  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => debouncedSearch.cancel()
  }, [searchQuery, debouncedSearch])

  // Filter transactions based on search and category
  const filteredTransactions = useMemo(() => {
    if (!transactions) {
      return []
    }

    if (transactions.length === 0) {
      return []
    }

    let filtered = transactions

    // Filter by either the debounced input search or the URL search parameter
    const effectiveSearchQuery = debouncedSearchQuery || urlSearchQuery
    if (effectiveSearchQuery) {
      const query = effectiveSearchQuery.toLowerCase()
      filtered = filter(filtered, (tx) => {
        return (
          tx.description.toLowerCase().includes(query) ||
          tx.category.toLowerCase().includes(query)
        )
      })
    }

    // Filter by category if not 'all'
    if (category !== 'all') {
      filtered = filter(
        filtered,
        (tx) => tx.category.toLowerCase() === category
      )
    }

    return filtered
  }, [transactions, debouncedSearchQuery, urlSearchQuery, category])

  const filteredCount = filteredTransactions.length

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    category,
    setCategory,
    urlSearchQuery,
    setUrlSearchQuery,
    filteredTransactions,
    filteredCount,
  }
}
