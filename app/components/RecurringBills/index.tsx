import React, { useState } from 'react'
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
  const [sortBy, setSortBy] = useState('latest')

  // Filter bills based on search term
  const filteredBills = transactions.filter(
    (bill) =>
      bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.category.toLowerCase().includes(searchTerm.toLowerCase())
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

      <div className='flex flex-col md:flex-row gap-8'>
        {/* Left column - Total Bills and Summary (1/3 width) */}
        <div className='w-full md:w-1/3 flex flex-col gap-6'>
          {/* Total bills card */}
          <Card className='bg-[#1a1a1e] min-h-[180px] text-white p-6'>
            <CardContent className='p-0 flex flex-col justify-between h-full'>
              <div className='mb-4'>
                <div className='w-12 h-12 bg-transparent mb-6'>
                  <Receipt className='w-10 h-10 text-white' />
                </div>
                <div>
                  <p className='text-base text-white mb-2'>Total Bills</p>
                  <h3 className='text-4xl font-bold'>
                    ${summary.totalBills.toFixed(2)}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary card */}
          <Card className='bg-white border-none shadow-none'>
            <CardContent className='p-6'>
              <h3 className='text-xl font-semibold mb-4'>Summary</h3>
              <BillsSummary summary={summary} />
            </CardContent>
          </Card>
        </div>

        {/* Right column - Bills table (2/3 width) */}
        <div className='w-full md:w-2/3'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex flex-col md:flex-row justify-between mb-6 gap-4'>
                {/* Search */}
                <div className='relative w-full md:w-[320px]'>
                  <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
                  <Input
                    type='text'
                    placeholder='Search bills'
                    className='pl-8 border border-gray-100 shadow-md'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Sort */}
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-500'>Sort by</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className='w-[120px] border border-gray-100 shadow-md'>
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
              </div>

              <BillsTable bills={sortedBills} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default RecurringBills
