import { useState, useRef, useEffect } from 'react'
import { AppTransaction } from '~/utils/transform-data'

interface UseTransactionsOptions {
  initialTransactions: AppTransaction[]
  itemsPerPage?: number
}

interface UseTransactionsReturn {
  visibleTransactions: AppTransaction[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  category: string
  setCategory: (category: string) => void
  hasMore: boolean
  loading: boolean
  loaderRef: React.RefObject<HTMLDivElement>
  categories: string[]
  formatCurrency: (amount: number) => string
  containerVariants: any
  itemVariants: any
}

export function useTransactions({
  initialTransactions,
  itemsPerPage = 10,
}: UseTransactionsOptions): UseTransactionsReturn {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [category, setCategory] = useState('all')
  const [visibleTransactions, setVisibleTransactions] = useState<
    AppTransaction[]
  >([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loaderRef = useRef<HTMLDivElement>(null)

  const allTransactions = initialTransactions || []

  // Filter transactions based on search, category, and sort
  const getFilteredTransactions = () => {
    let filtered = [...allTransactions]

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(
        (tx) => tx.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Sort transactions
    if (sortBy === 'latest') {
      filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    } else if (sortBy === 'oldest') {
      filtered.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    } else if (sortBy === 'a-z') {
      filtered.sort((a, b) => a.description.localeCompare(b.description))
    } else if (sortBy === 'z-a') {
      filtered.sort((a, b) => b.description.localeCompare(a.description))
    } else if (sortBy === 'highest') {
      filtered.sort((a, b) => b.amount - a.amount)
    } else if (sortBy === 'lowest') {
      filtered.sort((a, b) => a.amount - b.amount)
    }

    return filtered
  }

  // Load more transactions when scrolling
  const loadMoreTransactions = () => {
    if (loading) return

    setLoading(true)

    const filtered = getFilteredTransactions()
    const startIndex = 0
    const endIndex = Math.min(page * itemsPerPage, filtered.length)
    const newVisibleTransactions = filtered.slice(startIndex, endIndex)

    setVisibleTransactions(newVisibleTransactions)
    setHasMore(endIndex < filtered.length)
    setPage((prevPage) => prevPage + 1)
    setLoading(false)
  }

  // Initialize IntersectionObserver for infinite scroll
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreTransactions()
      }
    }, options)

    if (loaderRef.current) {
      observerRef.current.observe(loaderRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading])

  // Reset visible transactions when filters change
  useEffect(() => {
    setPage(1)
    setVisibleTransactions([])
    loadMoreTransactions()
  }, [searchQuery, sortBy, category])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Get all unique categories
  const categories = [
    'All Transactions',
    ...new Set(allTransactions.map((tx) => tx.category)),
  ]

  // Animation variants for transactions
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  }

  return {
    visibleTransactions,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    category,
    setCategory,
    hasMore,
    loading,
    loaderRef,
    categories,
    formatCurrency,
    containerVariants,
    itemVariants,
  }
}
