import { Card, CardTitle, CardHeader } from '~/components/ui/card'
import Pointer from '../../../../public/assets/icons/Pointer.svg'
import { formatDistanceToNow } from 'date-fns'
import { AppTransaction } from '~/utils/transform-data'

interface TransactionsOverviewProps {
  transactions: AppTransaction[]
  title?: string
}

const TransactionsOverview: React.FC<TransactionsOverviewProps> = ({
  transactions,
  title = 'Recent Transactions',
}) => {
  if (!transactions || transactions.length === 0) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | Date) => {
    try {
      const date =
        typeof dateString === 'string' ? new Date(dateString) : dateString
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return 'Invalid date'
    }
  }

  return (
    <Card className='p-[32px] flex flex-col gap-4 shadow-none'>
      <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
        <CardTitle className='text-[20px]'>{title}</CardTitle>
        <div className='text-[14px] text-[#696868] font-[500] flex flex-row items-center justify-end gap-[12px]'>
          View All
          <span>
            <img src={Pointer} alt='Pointer Icon' className={`h-2 w-2`} />
          </span>
        </div>
      </CardHeader>
      <div className='flex flex-col divide-y'>
        {transactions.slice(0, 5).map((transaction, index) => (
          <div
            key={transaction.id || index}
            className='py-4 first:pt-0 last:pb-0'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='w-10 h-10 rounded-full bg-[#F8F4F0] flex items-center justify-center mr-4'>
                  <img
                    src={transaction.avatar || ''}
                    alt={transaction.description}
                    className='w-6 h-6 object-contain'
                  />
                </div>
                <div>
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
                  className={`font-semibold text-[16px] ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}
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
        {transactions.length > 4 && (
          <div className='pt-4 text-center'>
            <span className='text-[14px] text-[#696868] font-[500]'>
              +{transactions.length - 4} more transactions
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}

export default TransactionsOverview
