import { useState, useMemo, useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from '@remix-run/react'
import { useTransactionsQuery } from '~/hooks/use-transactions-query'
import { AppTransaction } from '~/utils/transform-data'
import filter from 'lodash/filter'
import orderBy from 'lodash/orderBy'
import debounce from 'lodash/debounce'
import { format, formatDistanceToNow, subMonths } from 'date-fns'
import { renderAvatar } from '~/utils/avatar-utils'

export interface UseTransactionsReturn {
  isLoading: boolean
  error: unknown
  transactions: AppTransaction[] | undefined
  searchQuery: string
  setSearchQuery: (query: string) => void
  debouncedSearchQuery: string
  sortBy: string
  setSortBy: (sort: string) => void
  category: string
  setCategory: (category: string) => void
  categories: string[]
  visibleTransactions: AppTransaction[]
  filteredCount: number
  loadMore: () => void
  formatCurrency: (amount: number) => string
  formatTransactionDate: (dateString: string) => string
  isOverAMonthOld: (dateString: string) => boolean
  renderTransactionAvatar: (transaction: AppTransaction) => JSX.Element
  handleCategoryClick: (categoryName: string) => void
  handleSenderClick: (senderName: string) => void
}

export function useTransactions(): UseTransactionsReturn {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: transactions, isLoading, error } = useTransactionsQuery()
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [category, setCategory] = useState('all')

  // Create a debounced search handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchQuery(value)
    }, 200),
    []
  )

  // Update search query with debounce
  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])

  // Check for URL query parameters when component mounts
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const categoryParam = params.get('category')
    const searchParam = params.get('search')

    if (categoryParam) {
      setCategory(categoryParam.toLowerCase())
    }

    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [location.search])

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(Math.abs(amount))
  }

  // Helper function to check if a transaction date is over a month old
  const isOverAMonthOld = (dateString: string): boolean => {
    const date = new Date(dateString)
    const oneMonthAgo = subMonths(new Date(), 1)
    return date < oneMonthAgo
  }

  // Helper function to format transaction dates
  const formatTransactionDate = (dateString: string): string => {
    const date = new Date(dateString)

    // Format dates over a month old in GB format (dd/mm/yyyy)
    if (isOverAMonthOld(dateString)) {
      return format(date, 'dd/MM/yyyy')
    }

    // For recent dates, show relative time (e.g., "2 days ago")
    return formatDistanceToNow(date, { addSuffix: true })
  }

  // Helper function for rendering transaction avatars using the shared utility
  const renderTransactionAvatar = (
    transaction: AppTransaction
  ): JSX.Element => {
    return renderAvatar(transaction.description, transaction.avatar, 40)
  }

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) {
      console.error('No transactions data received')
      return []
    }

    if (transactions.length === 0) {
      return []
    }

    // Filter transactions using lodash filter
    let filtered = transactions

    // Apply search query filter with debounced value
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filter(filtered, (tx) => {
        return (
          tx.description.toLowerCase().includes(query) ||
          tx.category.toLowerCase().includes(query)
        )
      })
    }

    // Apply category filter
    if (category !== 'all') {
      filtered = filter(
        filtered,
        (tx) => tx.category.toLowerCase() === category
      )
    }

    switch (sortBy) {
      case 'latest':
        // For dates, we need to convert to timestamp for proper sorting
        return orderBy(
          filtered,
          [(tx: AppTransaction) => new Date(tx.date).getTime()],
          ['desc']
        )
      case 'oldest':
        return orderBy(
          filtered,
          [(tx: AppTransaction) => new Date(tx.date).getTime()],
          ['asc']
        )
      case 'a-z':
        return orderBy(filtered, ['description'], ['asc'])
      case 'z-a':
        return orderBy(filtered, ['description'], ['desc'])
      case 'highest':
        // For highest, we need to handle mixed signs correctly
        return orderBy(
          filtered,
          [
            // First sort by sign to prioritize positive values
            (tx: AppTransaction) => (tx.amount >= 0 ? 1 : 0),
            // Then sort by amount value
            'amount',
          ],
          ['desc', 'desc']
        )
      case 'lowest':
        // For lowest, we prioritize negative values and sort them by magnitude
        return orderBy(
          filtered,
          [
            // First sort by sign to prioritize negative values
            (tx: AppTransaction) => (tx.amount < 0 ? 0 : 1),
            // Then sort by amount
            'amount',
          ],
          ['asc', 'asc']
        )
      default:
        return filtered
    }
  }, [transactions, debouncedSearchQuery, category, sortBy])

  // Get the filtered count for proper hasMore evaluation
  const filteredCount = filteredTransactions.length

  // Get visible transactions for current page
  const visibleTransactions = useMemo(() => {
    return filteredTransactions.slice(0, page * 15)
  }, [filteredTransactions, page])

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    if (!transactions) return []

    const uniqueCategories = [
      ...new Set(transactions.map((tx: AppTransaction) => tx.category)),
    ]
    return ['All Transactions', ...uniqueCategories]
  }, [transactions])

  const loadMore = useCallback(() => {
    if (visibleTransactions.length < filteredTransactions.length) {
      setPage((prev: number) => prev + 1)
    }
  }, [visibleTransactions.length, filteredTransactions.length])

  // Add a handleCategoryClick function
  const handleCategoryClick = (categoryName: string) => {
    navigate(
      `/transactions?category=${encodeURIComponent(categoryName.toLowerCase())}`
    )
  }

  // Add a new handler function for recipient/sender clicks
  const handleSenderClick = (senderName: string) => {
    navigate(
      `/transactions?search=${encodeURIComponent(senderName.toLowerCase())}`
    )
    setSearchQuery(senderName)
  }

  return {
    isLoading,
    error,
    transactions,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    sortBy,
    setSortBy,
    category,
    setCategory,
    categories,
    visibleTransactions,
    filteredCount,
    loadMore,
    formatCurrency,
    formatTransactionDate,
    isOverAMonthOld,
    renderTransactionAvatar,
    handleCategoryClick,
    handleSenderClick,
  }
}
