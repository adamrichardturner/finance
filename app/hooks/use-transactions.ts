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

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchQuery(value)
    }, 200),
    []
  )

  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])

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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(Math.abs(amount))
  }

  const isOverAMonthOld = (dateString: string): boolean => {
    const date = new Date(dateString)
    const oneMonthAgo = subMonths(new Date(), 1)
    return date < oneMonthAgo
  }

  const formatTransactionDate = (dateString: string): string => {
    const date = new Date(dateString)

    if (isOverAMonthOld(dateString)) {
      return format(date, 'dd/MM/yyyy')
    }

    return formatDistanceToNow(date, { addSuffix: true })
  }

  const renderTransactionAvatar = (
    transaction: AppTransaction
  ): JSX.Element => {
    return renderAvatar(transaction.description, transaction.avatar, 40)
  }

  const filteredTransactions = useMemo(() => {
    if (!transactions) {
      return []
    }

    if (transactions.length === 0) {
      return []
    }

    let filtered = transactions

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filter(filtered, (tx) => {
        return (
          tx.description.toLowerCase().includes(query) ||
          tx.category.toLowerCase().includes(query)
        )
      })
    }

    if (category !== 'all') {
      filtered = filter(
        filtered,
        (tx) => tx.category.toLowerCase() === category
      )
    }

    switch (sortBy) {
      case 'latest':
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
        return orderBy(
          filtered,
          [(tx: AppTransaction) => (tx.amount >= 0 ? 1 : 0), 'amount'],
          ['desc', 'desc']
        )
      case 'lowest':
        return orderBy(
          filtered,
          [(tx: AppTransaction) => (tx.amount < 0 ? 0 : 1), 'amount'],
          ['asc', 'asc']
        )
      default:
        return filtered
    }
  }, [transactions, debouncedSearchQuery, category, sortBy])

  const filteredCount = filteredTransactions.length

  const visibleTransactions = useMemo(() => {
    return filteredTransactions.slice(0, page * 15)
  }, [filteredTransactions, page])

  const categories = useMemo<string[]>(() => {
    if (!transactions) return []

    const allCategories = transactions.map(
      (tx: AppTransaction) =>
        tx.category.charAt(0).toUpperCase() + tx.category.slice(1).toLowerCase()
    )

    const uniqueCategories: string[] = allCategories.filter(
      (category: string, index: number, self: string[]) =>
        self.indexOf(category) === index
    )

    uniqueCategories.sort((a, b) => a.localeCompare(b))

    return ['All Transactions', ...uniqueCategories]
  }, [transactions])

  const loadMore = useCallback(() => {
    if (visibleTransactions.length < filteredTransactions.length) {
      setPage((prev: number) => prev + 1)
    }
  }, [visibleTransactions.length, filteredTransactions.length])

  const handleCategoryClick = (categoryName: string) => {
    navigate(
      `/transactions?category=${encodeURIComponent(categoryName.toLowerCase())}`
    )
  }

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
