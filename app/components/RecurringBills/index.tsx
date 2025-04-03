import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { AppTransaction } from '~/utils/transform-data'
import PageTitle from '~/components/PageTitle'
import { Input } from '~/components/ui/input'
import { Search, Receipt } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import BillsSummary from './BillsSummary'
import BillsTable from './BillsTable'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import BillsDark from '/assets/icons/BillsDark.svg?url'
import debounce from 'lodash/debounce'
import { motion, AnimatePresence } from 'framer-motion'

interface RecurringBillsProps {
  transactions: AppTransaction[]
  summary: {
    totalBills: number
    paidBills: number
    totalUpcoming: number
    dueSoon: number
    paidCount: number
    upcomingCount: number
    dueSoonCount: number
  }
}

const RecurringBills: React.FC<RecurringBillsProps> = ({
  transactions,
  summary,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('latest')

  // Create a debounced search handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value)
    }, 200),
    []
  )

  // Update the debounced value when input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    debouncedSearch(e.target.value)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Filter bills based on debounced search term and exclude income (positive amounts)
  const filteredBills = transactions
    .filter((bill) => bill.amount < 0) // Only show expenses, not income
    .filter(
      (bill) =>
        bill.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        bill.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )

  // Sort bills based on selection
  const sortedBills = [...filteredBills].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case 'highest':
        return Math.abs(b.amount) - Math.abs(a.amount)
      case 'lowest':
        return Math.abs(a.amount) - Math.abs(b.amount)
      default:
        return 0
    }
  })

  return (
    <div className='w-full'>
      <PageTitle title='Recurring Bills' />

      <div className='flex flex-col max-[1127px]:flex-col min-[1127px]:flex-row gap-8'>
        {/* Left column - Total Bills and Summary (1/3 width) */}
        <div className='w-full min-[1127px]:w-1/3 flex flex-col gap-6'>
          {/* Total bills card - use dark styling on all screens */}
          <Card className='bg-[#1a1a1e] min-h-[180px] text-white p-6'>
            <CardContent className='p-0 flex flex-col justify-between h-full'>
              <div className='mb-4'>
                <div className='w-12 h-12 bg-transparent mb-6'>
                  <Receipt className='w-10 h-10 text-white' />
                </div>
                <div>
                  <p className='text-base text-white mb-2'>Total Bills</p>
                  <h3 className='text-4xl font-bold'>
                    {formatCurrency(summary.totalBills)}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary card - visible on all screens, styled differently on small */}
          <Card className='bg-white border-none shadow-none max-[640px]:px-0 max-[640px]:py-0'>
            <CardContent className='p-6 max-[640px]:p-0'>
              <h3 className='text-xl font-semibold mb-4 max-[640px]:hidden'>
                Summary
              </h3>
              <BillsSummary summary={summary} />
            </CardContent>
          </Card>
        </div>

        {/* Right column - Bills table (2/3 width) */}
        <div className='w-full min-[1127px]:w-2/3'>
          <Card className='max-[640px]:border-0 p-4 max-[640px]:shadow-none'>
            <CardContent className='p-6 max-[640px]:px-0 max-[640px]:py-4'>
              <div className='flex flex-row justify-between items-center mb-6 gap-4'>
                {/* Search */}
                <div className='relative flex-1'>
                  <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
                  <Input
                    type='text'
                    placeholder='Search bills'
                    className='pl-8 border border-gray-100 shadow-md'
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>

                {/* Desktop Sort */}
                <div className='relative hidden min-[640px]:block'>
                  <label className='absolute -top-3 left-2 text-[10px] bg-white px-1 z-10 text-muted-foreground'>
                    Sort by
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className='w-[120px] border border-gray-100 hover:shadow-lg transition-shadow duration-200 shadow-md'>
                      <SelectValue placeholder='Sort by' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='latest'>Latest</SelectItem>
                      <SelectItem value='oldest'>Oldest</SelectItem>
                      <SelectItem value='highest'>Highest</SelectItem>
                      <SelectItem value='lowest'>Lowest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mobile Sort Icon */}
                <div className='block min-[640px]:hidden'>
                  <Sheet>
                    <SheetTrigger asChild>
                      <div className='w-8 h-8 flex items-center justify-center cursor-pointer'>
                        <img
                          src={BillsDark}
                          alt='Sort bills'
                          className='w-6 h-6'
                        />
                      </div>
                    </SheetTrigger>
                    <SheetContent side='bottom'>
                      <SheetHeader>
                        <SheetTitle className='mb-2 text-base'>
                          Sort Bills
                        </SheetTitle>
                      </SheetHeader>
                      <div className='grid grid-cols-2 gap-2 max-h-[calc(60vh-60px)] overflow-y-auto'>
                        {[
                          { value: 'latest', label: 'Latest' },
                          { value: 'oldest', label: 'Oldest' },
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
                </div>
              </div>

              <AnimatePresence mode='wait'>
                <motion.div
                  key={debouncedSearchTerm}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <BillsTable bills={sortedBills} />
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default RecurringBills
