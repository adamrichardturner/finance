import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Search, Loader2 } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '~/components/ui/table'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import PageTitle from '~/components/PageTitle'
import { AppTransaction } from '~/utils/transform-data'
import { formatDistanceToNow } from 'date-fns'
import { useTransactionsQuery } from '~/hooks/use-transactions-query'
import InfiniteScroll from 'react-infinite-scroll-component'

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
}

export function Transactions() {
  const {
    data: transactions,
    isLoading,
    error,
    refetch,
  } = useTransactionsQuery()
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [category, setCategory] = useState('all')

  // Force a refetch if transactions are initially empty
  React.useEffect(() => {
    if (!isLoading && (!transactions || transactions.length === 0)) {
      console.log('No transactions found, retrying fetch...')
      // Wait a moment for any pending operations to complete
      const timer = setTimeout(() => {
        refetch()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, transactions, refetch])

  // Log transaction data at component level with detailed inspection
  console.log(
    'Transactions component - received data:',
    transactions
      ? {
          count: transactions.length,
          sample: transactions.slice(0, 2),
          isEmpty: transactions.length === 0,
        }
      : 'No transactions data'
  )

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) {
      console.error('No transactions data received')
      return []
    }

    if (transactions.length === 0) {
      console.log('Received empty transactions array')
      return []
    }

    console.log(`Filtering ${transactions.length} transactions`)

    // Filter by search query
    let filtered = transactions
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(query) ||
          tx.category.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter((tx) => tx.category.toLowerCase() === category)
    }

    // Sort transactions
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'a-z':
          return a.description.localeCompare(b.description)
        case 'z-a':
          return b.description.localeCompare(a.description)
        case 'highest':
          return b.amount - a.amount
        case 'lowest':
          return a.amount - b.amount
        default:
          return 0
      }
    })
  }, [transactions, searchQuery, category, sortBy])

  // Get visible transactions for current page
  const visibleTransactions = useMemo(() => {
    return filteredTransactions.slice(0, page * 15)
  }, [filteredTransactions, page])

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    if (!transactions) return []

    const uniqueCategories = [...new Set(transactions.map((tx) => tx.category))]
    return ['All Transactions', ...uniqueCategories]
  }, [transactions])

  const loadMore = useCallback(() => {
    if (visibleTransactions.length < filteredTransactions.length) {
      setPage((prev) => prev + 1)
    }
  }, [visibleTransactions.length, filteredTransactions.length])

  // Handle loading state
  if (isLoading) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[240px]'>
                    Recipient / Sender
                  </TableHead>
                  <TableHead className='w-[180px]'>Category</TableHead>
                  <TableHead className='w-[180px]'>Transaction Date</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className='animate-pulse'>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <div className='h-8 w-8 rounded-full bg-gray-200' />
                        <div className='h-4 w-32 bg-gray-200 rounded' />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='h-4 w-20 bg-gray-200 rounded' />
                    </TableCell>
                    <TableCell>
                      <div className='h-4 w-24 bg-gray-200 rounded' />
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='h-4 w-16 bg-gray-200 rounded ml-auto' />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle error state
  if (error || !transactions) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className='p-4'>
          <div className='flex flex-col justify-center items-center py-8 gap-4'>
            <div className='text-red-500 rounded-full bg-red-100 p-3'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='lucide lucide-alert-triangle'
              >
                <path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' />
                <path d='M12 9v4' />
                <path d='M12 17h.01' />
              </svg>
            </div>
            <p className='text-muted-foreground'>Failed to load transactions</p>
            <button
              onClick={() => window.location.reload()}
              className='px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors'
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters section */}
        <div className='mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
          {/* Search input */}
          <div className='relative w-full sm:max-w-[320px]'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
            <Input
              type='text'
              placeholder='Search transaction'
              className='pl-8'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter dropdowns */}
          <div className='flex space-x-2'>
            <div className='w-32'>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='latest'>Latest</SelectItem>
                  <SelectItem value='oldest'>Oldest</SelectItem>
                  <SelectItem value='a-z'>A to Z</SelectItem>
                  <SelectItem value='z-a'>Z to A</SelectItem>
                  <SelectItem value='highest'>Highest</SelectItem>
                  <SelectItem value='lowest'>Lowest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='w-40'>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder='Category' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Transactions</SelectItem>
                  {categories.map(
                    (cat) =>
                      cat !== 'All Transactions' && (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Transactions table with infinite scroll */}
        <div
          id='scrollable-transactions'
          className='overflow-auto hide-scrollbar'
          style={{
            maxHeight: '65vh',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            overflowY: 'auto',
          }}
        >
          <style>
            {`
              /* Hide all scrollbars within transactions component */
              #scrollable-transactions::-webkit-scrollbar,
              .infinite-scroll-component::-webkit-scrollbar,
              .infinite-scroll-component__outerdiv::-webkit-scrollbar,
              .rounded-md::-webkit-scrollbar,
              table::-webkit-scrollbar,
              div::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }
              
              #scrollable-transactions,
              .infinite-scroll-component,
              .infinite-scroll-component__outerdiv,
              .rounded-md,
              table,
              div {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
              }
              
              /* Additional fix for InfiniteScroll component */
              .infinite-scroll-component {
                overflow: auto !important;
                overflow-y: auto !important;
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
              }
            `}
          </style>

          <InfiniteScroll
            dataLength={visibleTransactions.length}
            next={loadMore}
            hasMore={visibleTransactions.length < filteredTransactions.length}
            loader={
              <div className='flex justify-center py-4'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              </div>
            }
            scrollableTarget='scrollable-transactions'
            scrollThreshold={0.8}
            style={{ overflow: 'hidden', overflowY: 'auto' }}
            className='hide-scrollbar'
          >
            {visibleTransactions.length > 0 ? (
              <div className='rounded-md border hide-scrollbar'>
                <Table className='hide-scrollbar'>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[240px]'>
                        Recipient / Sender
                      </TableHead>
                      <TableHead className='w-[180px]'>Category</TableHead>
                      <TableHead className='w-[180px]'>
                        Transaction Date
                      </TableHead>
                      <TableHead className='text-right'>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleTransactions.map((transaction, index) => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        index={index}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className='flex justify-center items-center py-8'>
                <p className='text-muted-foreground'>No transactions found</p>
              </div>
            )}
          </InfiniteScroll>
        </div>
      </CardContent>
    </Card>
  )
}

interface TransactionItemProps {
  transaction: AppTransaction
  index: number
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  index,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount))
  }

  return (
    <motion.tr
      variants={itemVariants}
      initial='hidden'
      animate='visible'
      custom={index}
      className='transition-colors hover:bg-muted/50'
    >
      <TableCell className='flex items-center gap-3'>
        {transaction.avatar ? (
          <img
            src={transaction.avatar}
            alt={transaction.description}
            className='h-8 w-8 rounded-full bg-gray-100'
          />
        ) : (
          <div className='h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center'>
            {transaction.description.charAt(0)}
          </div>
        )}
        <span>{transaction.description}</span>
      </TableCell>
      <TableCell>{transaction.category}</TableCell>
      <TableCell>
        {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
      </TableCell>
      <TableCell
        className={`text-right ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
      >
        {transaction.amount >= 0 ? '+' : ''}
        {formatCurrency(transaction.amount)}
      </TableCell>
    </motion.tr>
  )
}

export default Transactions
