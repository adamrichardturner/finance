import { motion, AnimatePresence } from 'framer-motion'
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
import { useTransactions } from '~/hooks/use-transactions'
import { getThemeForCategory } from '~/utils/budget-categories'
import { AppTransaction } from '~/utils/transform-data'
import Pointer from '../../../public/assets/icons/Pointer.svg'

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0,
      duration: 0.15,
    },
  }),
}

export function Transactions() {
  const {
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
  } = useTransactions()

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
      <CardHeader className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <CardTitle>
          {category !== 'all' ? (
            <div className='flex flex-col'>
              <span className='text-2xl'>
                {category.charAt(0).toUpperCase() + category.slice(1)}{' '}
                Transactions
              </span>
              <span className='text-sm text-gray-500 font-normal'>
                Showing {visibleTransactions.length} transaction
                {visibleTransactions.length !== 1 ? 's' : ''}
                {filteredCount > 0 && ` of ${filteredCount}`}
              </span>
            </div>
          ) : (
            'Transactions'
          )}
        </CardTitle>
        {category !== 'all' && (
          <span
            className='mt-2 sm:mt-0 text-[14px] text-gray-500 cursor-pointer hover:text-black transition-colors flex items-center'
            onClick={() => setCategory('all')}
          >
            View all transactions
            <span className='ml-2'>
              <img src={Pointer} alt='Pointer Icon' className='h-2 w-2' />
            </span>
          </span>
        )}
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
              className='pl-8 border border-gray-100 hover:shadow-lg transition-shadow duration-200 placeholder:text-xs sm:placeholder:text-sm shadow-md'
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
                <SelectTrigger className='w-[160px] border border-gray-100 hover:shadow-lg transition-shadow duration-200 shadow-md'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent className='min-w-[160px]'>
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
                <SelectTrigger className='w-[180px] border border-gray-100 hover:shadow-lg transition-shadow duration-200 shadow-md'>
                  <SelectValue placeholder='Category' />
                </SelectTrigger>
                <SelectContent className='min-w-[180px] max-h-[300px] overflow-y-auto'>
                  <SelectItem value='all'>All Transactions</SelectItem>
                  {categories.map(
                    (cat: string) =>
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
                  className='border border-gray-100 hover:shadow-lg transition-shadow duration-200 shadow-md'
                >
                  <ArrowUpDown className='h-4 w-4' />
                </Button>
              </SheetTrigger>
              <SheetContent side='bottom'>
                <SheetHeader>
                  <SheetTitle className='mb-2 text-base'>
                    Sort Transactions
                  </SheetTitle>
                </SheetHeader>
                <div className='grid grid-cols-2 gap-2 max-h-[calc(60vh-60px)] overflow-y-auto'>
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
                        className='w-full justify-start text-sm h-[38px]'
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
                  className='border border-gray-100 hover:shadow-lg transition-shadow duration-200 shadow-md'
                >
                  <Filter className='h-4 w-4' />
                </Button>
              </SheetTrigger>
              <SheetContent side='bottom'>
                <SheetHeader>
                  <SheetTitle className='mb-2 text-base'>
                    Filter by Category
                  </SheetTitle>
                </SheetHeader>
                <div className='grid grid-cols-2 gap-2 max-h-[calc(60vh-60px)] overflow-y-auto'>
                  <SheetClose asChild>
                    <Button
                      variant={category === 'all' ? 'default' : 'outline'}
                      className='w-full justify-start text-sm h-[38px]'
                      onClick={() => setCategory('all')}
                    >
                      All Transactions
                    </Button>
                  </SheetClose>
                  {categories
                    .filter((cat: string) => cat !== 'All Transactions')
                    .map((cat: string) => (
                      <SheetClose key={cat} asChild>
                        <Button
                          variant={
                            category === cat.toLowerCase()
                              ? 'default'
                              : 'outline'
                          }
                          className='w-full justify-start text-sm h-[38px]'
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
            maxHeight: window.innerWidth < 640 ? '50vh' : '65vh',
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

          <AnimatePresence mode='wait'>
            <motion.div
              key={debouncedSearchQuery + category + sortBy}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <InfiniteScroll
                dataLength={visibleTransactions.length}
                next={loadMore}
                hasMore={visibleTransactions.length < filteredCount}
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
                            <TableHead className='w-[40%] text-[12px]'>
                              Recipient / Sender
                            </TableHead>
                            <TableHead className='w-[15%] text-left text-[12px]'>
                              Category
                            </TableHead>
                            <TableHead className='w-[15%] text-left text-[12px]'>
                              Transaction Date
                            </TableHead>
                            <TableHead className='w-[30%] text-right text-[12px]'>
                              Amount
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {visibleTransactions.map(
                            (transaction: AppTransaction, index: number) => (
                              <tr
                                key={transaction.id}
                                className='transition-colors duration-200 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-[#f9f9f9]'
                              >
                                <TableCell className='flex items-center gap-3 min-h-[56px]'>
                                  {renderTransactionAvatar(transaction)}
                                  <span
                                    className='cursor-pointer font-semibold hover:font-[700] transition-all'
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSenderClick(transaction.description)
                                    }}
                                  >
                                    {transaction.description}
                                  </span>
                                </TableCell>
                                <TableCell className='text-left'>
                                  <div
                                    className='flex items-center justify-start gap-2 cursor-pointer hover:font-[600] transition-all'
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCategoryClick(transaction.category)
                                    }}
                                  >
                                    <div
                                      className='h-2 w-2 rounded-full flex-shrink-0 text-[12px]'
                                      style={{
                                        backgroundColor: getThemeForCategory(
                                          transaction.category
                                        ),
                                      }}
                                    />
                                    <span className='text-[12px] text-color-grey-500'>
                                      {transaction.category}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className='font-[400] text-[12px] text-left'>
                                  {formatTransactionDate(transaction.date)}
                                </TableCell>
                                <TableCell
                                  className={`text-right font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-gray-900'}`}
                                >
                                  {transaction.amount >= 0 ? '+' : '-'}
                                  {formatCurrency(Math.abs(transaction.amount))}
                                </TableCell>
                              </tr>
                            )
                          )}
                          {/* Add padding row to ensure smooth scrolling */}
                          <tr className='h-8'>
                            <td colSpan={4}></td>
                          </tr>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile View */}
                    <div className='sm:hidden mb-10'>
                      {visibleTransactions.map(
                        (transaction: AppTransaction, index: number) => (
                          <motion.div
                            key={transaction.id}
                            variants={itemVariants}
                            initial='hidden'
                            animate='visible'
                            custom={index}
                            className='flex items-center justify-between py-4 px-2 border-b border-gray-100 last:border-0 transition-colors duration-200 hover:bg-[#f9f9f9] rounded-lg cursor-pointer mb-1'
                          >
                            <div className='flex items-start gap-3 flex-1'>
                              {renderTransactionAvatar(transaction)}
                              <div className='flex flex-col'>
                                <span
                                  className='font-medium text-sm cursor-pointer hover:font-[700] transition-all'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSenderClick(transaction.description)
                                  }}
                                >
                                  {transaction.description}
                                </span>
                                <span
                                  className='text-xs text-gray-500 font-normal flex items-center gap-1 cursor-pointer hover:font-[700] transition-all mt-1'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCategoryClick(transaction.category)
                                  }}
                                >
                                  <div
                                    className='h-2 w-2 rounded-full flex-shrink-0'
                                    style={{
                                      backgroundColor: getThemeForCategory(
                                        transaction.category
                                      ),
                                    }}
                                  />
                                  {transaction.category}
                                </span>
                              </div>
                            </div>
                            <div className='flex flex-col items-end'>
                              <span
                                className={`font-bold text-sm ${transaction.amount >= 0 ? 'text-green-600' : 'text-gray-900'}`}
                              >
                                {transaction.amount >= 0 ? '+' : '-'}
                                {formatCurrency(Math.abs(transaction.amount))}
                              </span>
                              <span className='text-xs text-gray-500 font-normal text-center'>
                                {formatTransactionDate(transaction.date)}
                              </span>
                            </div>
                          </motion.div>
                        )
                      )}
                    </div>
                  </>
                ) : (
                  <div className='flex justify-center items-center py-8'>
                    <p className='text-muted-foreground'>
                      No transactions found
                    </p>
                  </div>
                )}
              </InfiniteScroll>
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}

export default Transactions
