import { useState, useMemo, useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from '@remix-run/react'
import { useTransactionsQuery } from '~/hooks/use-transactions-query'
import { AppTransaction } from '~/utils/transform-data'
import filter from 'lodash/filter'
import orderBy from 'lodash/orderBy'
import * as React from 'react'

export interface UseTransactionsReturn {
  isLoading: boolean
  error: unknown
  transactions: AppTransaction[] | undefined
  searchQuery: string
  setSearchQuery: (query: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  category: string
  setCategory: (category: string) => void
  categories: string[]
  visibleTransactions: AppTransaction[]
  filteredCount: number
  loadMore: () => void
  formatCurrency: (amount: number) => string
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
  const [sortBy, setSortBy] = useState('latest')
  const [category, setCategory] = useState('all')

  // Check for URL query parameters when component mounts
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const categoryParam = params.get('category')

    if (categoryParam) {
      setCategory(categoryParam.toLowerCase())
    }
  }, [location.search])

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(Math.abs(amount))
  }

  // Helper function for rendering transaction avatars
  const renderTransactionAvatar = (
    transaction: AppTransaction
  ): JSX.Element => {
    const getColorFromName = (name: string): string => {
      const colors = [
        '#5E76BF',
        '#F58A51',
        '#47B4AC',
        '#D988B9',
        '#B0A0D6',
        '#FFB6C1',
        '#87CEEB',
        '#FFA07A',
        '#98FB98',
        '#DDA0DD',
      ]

      const hash = name.split('').reduce((acc: number, char: string) => {
        return acc + char.charCodeAt(0)
      }, 0)

      return colors[hash % colors.length]
    }

    const firstLetter = transaction.description.charAt(0).toUpperCase()
    const bgColor = getColorFromName(transaction.description)

    return React.createElement('div', {
      className:
        'relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0',
      children: [
        transaction.avatar &&
          React.createElement('img', {
            key: 'avatar-img',
            src: transaction.avatar,
            alt: `${transaction.description} avatar`,
            className: 'h-full w-full object-cover',
            onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const fallbackDiv =
                target.parentElement?.querySelector('.fallback-avatar')
              if (fallbackDiv && fallbackDiv instanceof HTMLElement) {
                fallbackDiv.style.display = 'flex'
              }
            },
          }),
        React.createElement('div', {
          key: 'fallback-avatar',
          className:
            'fallback-avatar absolute inset-0 flex items-center justify-center text-white font-medium text-lg',
          style: {
            backgroundColor: bgColor,
            display: transaction.avatar ? 'none' : 'flex',
          },
          children: firstLetter,
        }),
      ],
    })
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

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
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
  }, [transactions, searchQuery, category, sortBy])

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
    sortBy,
    setSortBy,
    category,
    setCategory,
    categories,
    visibleTransactions,
    filteredCount,
    loadMore,
    formatCurrency,
    renderTransactionAvatar,
    handleCategoryClick,
    handleSenderClick,
  }
}
