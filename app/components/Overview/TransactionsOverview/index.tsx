import { Card, CardTitle, CardHeader } from '~/components/ui/card'
import Pointer from '../../../../public/assets/icons/Pointer.svg'
import { formatDistanceToNow } from 'date-fns'
import { AppTransaction } from '~/utils/transform-data'
import React from 'react'

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

  return (
    <Card className='p-[32px] flex flex-col gap-4 shadow-none'>
      <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
        <CardTitle className='text-[20px]'>{title}</CardTitle>
        <div
          className='text-[14px] text-gray-500 cursor-pointer hover:text-black transition-colors items-center flex flex-row gap-1'
          onClick={() => {}}
        >
          View All
          <span>
            <img src={Pointer} alt='Pointer Icon' className={`h-2 w-2 ml-2`} />
          </span>
        </div>
      </CardHeader>
      <div className='flex flex-col divide-y'>
        {transactions.slice(0, 4).map((transaction, index) => (
          <div
            key={transaction.id || index}
            className='py-4 last:pb-0 transition-colors p-1.5 duration-200 hover:bg-gray-100'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                {renderTransactionAvatar(transaction)}
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
