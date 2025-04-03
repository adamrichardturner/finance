import { Card, CardTitle, CardHeader } from '~/components/ui/card'
import Pointer from '/assets/icons/Pointer.svg?url'
import { formatDistanceToNow, format, isAfter, subMonths } from 'date-fns'
import { AppTransaction } from '~/utils/transform-data'
import React, { useMemo } from 'react'
import { renderAvatar } from '~/utils/avatar-utils'
import { useNavigate } from '@remix-run/react'

interface TransactionsOverviewProps {
  transactions: AppTransaction[]
  title?: string
}

const TransactionsOverview: React.FC<TransactionsOverviewProps> = ({
  transactions,
  title = 'Recent Transactions',
}) => {
  const navigate = useNavigate()

  if (!transactions || transactions.length === 0) {
    return null
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const isPotTransaction =
        tx.description.toLowerCase().includes('pot') ||
        tx.category.toLowerCase().includes('pot') ||
        tx.description.toLowerCase().includes('savings')

      return !isPotTransaction
    })
  }, [transactions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const isOverAMonthOld = (date: Date): boolean => {
    const oneMonthAgo = subMonths(new Date(), 1)
    return !isAfter(date, oneMonthAgo)
  }

  const formatDate = (dateString: string | Date) => {
    try {
      const date =
        typeof dateString === 'string' ? new Date(dateString) : dateString

      if (isOverAMonthOld(date)) {
        return format(date, 'dd/MM/yyyy')
      }

      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const displayTransactions = filteredTransactions.slice(0, 4)

  const remainingCount = filteredTransactions.length - 4

  return (
    <Card className='p-[32px] flex flex-col gap-4 shadow-none'>
      <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
        <CardTitle className='text-[20px]'>{title}</CardTitle>
        <div
          className='text-[14px] text-gray-500 cursor-pointer hover:text-black transition-colors items-center flex flex-row gap-1'
          onClick={() => navigate('/transactions')}
        >
          View All
          <span>
            <img src={Pointer} alt='Pointer Icon' className={`h-2 w-2 ml-2`} />
          </span>
        </div>
      </CardHeader>
      <div className='flex flex-col divide-y'>
        {displayTransactions.map((transaction, index) => (
          <div
            key={transaction.id || index}
            className='py-4 last:pb-0 transition-colors duration-200 hover:bg-[#f9f9f9] p-1.5 rounded-md cursor-pointer'
            onClick={() =>
              navigate(
                `/transactions?search=${encodeURIComponent(transaction.description)}`
              )
            }
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                {renderAvatar(transaction.description, transaction.avatar, 40)}
                <div className='ml-4'>
                  <h3 className='font-semibold text-[16px]'>
                    {transaction.description}
                  </h3>
                  <p className='text-[#696868] text-[12px]'>
                    {transaction.category}
                  </p>
                </div>
              </div>
              <div className='text-right'>
                <p
                  className={`font-semibold text-[14px] ${transaction.amount < 0 ? 'text-gray-900' : 'text-green-600'}`}
                >
                  {transaction.amount < 0 ? '-' : '+'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </p>
                <p className='text-[#696868] text-[12px]'>
                  {formatDate(transaction.date)}
                </p>
              </div>
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className='pt-4 text-center'>
            <span className='text-[14px] text-[#696868] font-[500]'>
              +{remainingCount} more transactions
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}

export default TransactionsOverview
