import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Search, Loader2, ArrowUpDown, Filter } from 'lucide-react'
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
import { AppTransaction } from '~/utils/transform-data'
import { formatDistanceToNow } from 'date-fns'
import { useTransactionsQuery } from '~/hooks/use-transactions-query'
import InfiniteScroll from 'react-infinite-scroll-component'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import filter from 'lodash/filter'
import orderBy from 'lodash/orderBy'

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
  const { data: transactions, isLoading, error } = useTransactionsQuery()
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [category, setCategory] = useState('all')

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
  ): React.ReactNode => {
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

      const hash = name.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0)
      }, 0)

      return colors[hash % colors.length]
    }

    const firstLetter = transaction.description.charAt(0).toUpperCase()
    const bgColor = getColorFromName(transaction.description)

    return (
      <div className='relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0'>
        {transaction.avatar && (
          <img
            src={transaction.avatar}
            alt={`${transaction.description} avatar`}
            className='h-full w-full object-cover'
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const fallbackDiv =
                target.parentElement?.querySelector('.fallback-avatar')
              if (fallbackDiv && fallbackDiv instanceof HTMLElement) {
                fallbackDiv.style.display = 'flex'
              }
            }}
          />
        )}
        <div
          className='fallback-avatar absolute inset-0 flex items-center justify-center text-white font-medium text-lg'
          style={{
            backgroundColor: bgColor,
            display: transaction.avatar ? 'none' : 'flex',
          }}
        >
          {firstLetter}
        </div>
      </div>
    )
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
          [(tx) => new Date(tx.date).getTime()],
          ['desc']
        )
      case 'oldest':
        return orderBy(filtered, [(tx) => new Date(tx.date).getTime()], ['asc'])
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
            (tx) => (tx.amount >= 0 ? 1 : 0),
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
            (tx) => (tx.amount < 0 ? 0 : 1),
            // Then sort by amount
            'amount',
          ],
          ['asc', 'asc']
        )
      default:
        return filtered
    }
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
    <Card className='w-full shadow-none'>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters section */}
        <div className='mb-6 flex flex-row items-center justify-between'>
          {/* Search input - always visible */}
          <div className='relative sm:w-[121px] md:w-[200px] lg:w-[320px] pr-4'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
            <Input
              type='text'
              placeholder='Search'
              className='pl-8 border border-[#201F24] placeholder:text-xs sm:placeholder:text-sm'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Desktop & Tablet filter controls - hidden on mobile */}
          <div className='hidden sm:flex items-center space-x-4'>
            <div className='relative'>
              <label className='absolute -top-3 left-2 text-[10px] bg-white px-1 z-10 text-muted-foreground'>
                Sort by
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='w-[120px] border border-[#201F24]'>
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

            <div className='relative'>
              <label className='absolute -top-3 left-2 text-[10px] bg-white px-1 z-10 text-muted-foreground'>
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className='w-[140px] border border-[#201F24]'>
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

          {/* Mobile filter icons - visible only on mobile */}
          <div className='flex sm:hidden space-x-2 ml-2'>
            {/* Sort Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='border border-[#201F24]'
                >
                  <ArrowUpDown className='h-4 w-4' />
                </Button>
              </SheetTrigger>
              <SheetContent side='bottom'>
                <SheetHeader>
                  <SheetTitle className='mb-4'>Sort Transactions</SheetTitle>
                </SheetHeader>
                <div className='grid gap-4'>
                  {[
                    { value: 'latest', label: 'Latest' },
                    { value: 'oldest', label: 'Oldest' },
                    { value: 'a-z', label: 'A to Z' },
                    { value: 'z-a', label: 'Z to A' },
                    { value: 'highest', label: 'Highest Amount' },
                    { value: 'lowest', label: 'Lowest Amount' },
                  ].map((option) => (
                    <SheetClose key={option.value} asChild>
                      <Button
                        variant={
                          sortBy === option.value ? 'default' : 'outline'
                        }
                        className='w-full justify-start h-[42px]'
                        onClick={() => setSortBy(option.value)}
                      >
                        {option.label}
                      </Button>
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='border border-[#201F24]'
                >
                  <Filter className='h-4 w-4' />
                </Button>
              </SheetTrigger>
              <SheetContent side='bottom'>
                <SheetHeader>
                  <SheetTitle className='mb-4'>Filter by Category</SheetTitle>
                </SheetHeader>
                <div className='grid gap-4'>
                  <SheetClose asChild>
                    <Button
                      variant={category === 'all' ? 'default' : 'outline'}
                      className='w-full justify-start h-[42px]'
                      onClick={() => setCategory('all')}
                    >
                      All Transactions
                    </Button>
                  </SheetClose>
                  {categories
                    .filter((cat) => cat !== 'All Transactions')
                    .map((cat) => (
                      <SheetClose key={cat} asChild>
                        <Button
                          variant={
                            category === cat.toLowerCase()
                              ? 'default'
                              : 'outline'
                          }
                          className='w-full justify-start h-[42px]'
                          onClick={() => setCategory(cat.toLowerCase())}
                        >
                          {cat}
                        </Button>
                      </SheetClose>
                    ))}
                </div>
              </SheetContent>
            </Sheet>
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
              <div className='flex justify-center sticky bottom-0 py-8 bg-card shadow-md border-t'>
                <Loader2 className='h-6 w-6 animate-spin text-primary' />
              </div>
            }
            scrollableTarget='scrollable-transactions'
            scrollThreshold={0.25}
            style={{ overflow: 'hidden', overflowY: 'auto' }}
            className='hide-scrollbar'
            endMessage={
              <div className='flex justify-center py-2 text-xs text-muted-foreground'>
                End of transactions
              </div>
            }
          >
            {visibleTransactions.length > 0 ? (
              <>
                {/* Desktop & Tablet View */}
                <div className='hidden sm:block hide-scrollbar'>
                  <Table className='hide-scrollbar'>
                    <TableHeader className='sticky top-0 bg-card z-10'>
                      <TableRow className='border-b border-gray-200'>
                        <TableHead className='w-[30%]'>
                          Recipient / Sender
                        </TableHead>
                        <TableHead className='w-[15%] text-left'>
                          Category
                        </TableHead>
                        <TableHead className='w-[15%] text-left'>
                          Transaction Date
                        </TableHead>
                        <TableHead className='w-[30%] text-right'>
                          Amount
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleTransactions.map((transaction, index) => (
                        <tr
                          key={transaction.id}
                          className='transition-colors hover:bg-muted/50 border-b border-gray-100 last:border-0'
                        >
                          <TableCell className='flex items-center gap-3'>
                            {renderTransactionAvatar(transaction)}
                            <span>{transaction.description}</span>
                          </TableCell>
                          <TableCell className='text-left'>
                            {transaction.category}
                          </TableCell>
                          <TableCell className='text-left'>
                            {formatDistanceToNow(new Date(transaction.date), {
                              addSuffix: true,
                            })}
                          </TableCell>
                          <TableCell
                            className={`text-right ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {transaction.amount >= 0 ? '+' : ''}
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                        </tr>
                      ))}
                      {/* Add padding row to ensure smooth scrolling */}
                      <tr className='h-8'>
                        <td colSpan={4}></td>
                      </tr>
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View */}
                <div className='sm:hidden'>
                  {visibleTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      variants={itemVariants}
                      initial='hidden'
                      animate='visible'
                      custom={index}
                      className='flex items-center justify-between py-4 px-2 border-b border-gray-100 last:border-0'
                    >
                      <div className='flex items-start gap-3'>
                        {renderTransactionAvatar(transaction)}
                        <div className='flex flex-col'>
                          <span className='font-medium text-sm'>
                            {transaction.description}
                          </span>
                          <span className='text-xs text-gray-500 font-normal'>
                            {transaction.category}
                          </span>
                        </div>
                      </div>
                      <div className='flex flex-col items-end'>
                        <span
                          className={`font-medium text-sm ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {transaction.amount >= 0 ? '+' : ''}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <span className='text-xs text-gray-500 font-normal'>
                          {formatDistanceToNow(new Date(transaction.date), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
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

export default Transactions
