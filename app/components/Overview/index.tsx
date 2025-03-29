import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import { useFinancialData } from '~/hooks/use-financial-data'
import PageTitle from '../PageTitle'
import Pill from './Pill'
import { useEffect } from 'react'

interface OverviewProps {
  isDemoUser: boolean
  requestUrl?: string
}

const Overview: React.FC<OverviewProps> = ({ isDemoUser, requestUrl }) => {
  // Debug log props
  useEffect(() => {
    console.log('Overview rendered with props:', { isDemoUser, requestUrl })
  }, [isDemoUser, requestUrl])

  // Use the simplified hook that no longer tries to load server-side data in browser
  const { financialData, loading, error, monzoConnected } = useFinancialData(
    isDemoUser,
    requestUrl
  )

  // Debug log the hook results
  useEffect(() => {
    console.log('useFinancialData hook result:', {
      loading,
      hasError: !!error,
      errorMsg: error?.message,
      balance: financialData.balance,
      transactions: financialData.transactions.length,
    })
  }, [financialData, loading, error])

  if (loading) {
    console.log('Rendering loading state...')
    return (
      <div className='w-full flex-1 flex items-center justify-center'>
        <p>Loading financial data...</p>
      </div>
    )
  }

  if (error) {
    console.log('Rendering error state:', error.message)
    return (
      <div className='w-full flex-1'>
        <p>Error loading financial data: {error.message}</p>
      </div>
    )
  }

  console.log(
    'Rendering main content with transactions:',
    financialData.transactions.length
  )
  return (
    <div className='w-full'>
      <PageTitle title='Overview' />
      {!isDemoUser && !monzoConnected && (
        <div className='mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md'>
          <p className='text-yellow-700'>
            Connect your Monzo account to see your actual financial data.{' '}
            <a href='/monzo-auth' className='text-blue-600 hover:underline'>
              Connect now
            </a>
          </p>
        </div>
      )}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <Pill
          title='Total Balance'
          amount={formatCurrency(financialData.balance)}
          icon={<DollarSignIcon className='text-blue-500' size={24} />}
        />
        <Pill
          title='Income'
          amount={formatCurrency(financialData.income)}
          icon={<TrendingUpIcon className='text-green-500' size={24} />}
        />
        <Pill
          title='Expenses'
          amount={formatCurrency(financialData.expenses)}
          icon={<TrendingDownIcon className='text-red-500' size={24} />}
        />
      </div>

      {financialData.transactions.length > 0 && (
        <div className='mt-8'>
          <h2 className='text-xl font-semibold mb-4'>Recent Transactions</h2>
          <div className='bg-white rounded-md shadow p-4'>
            <ul className='divide-y divide-gray-200'>
              {financialData.transactions.slice(0, 5).map((transaction) => (
                <li key={transaction.id} className='py-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      {transaction.avatar && (
                        <img
                          src={transaction.avatar}
                          alt=''
                          className='w-8 h-8 rounded-full mr-3'
                        />
                      )}
                      {!transaction.avatar && (
                        <div className='w-8 h-8 rounded-full bg-gray-200 mr-3'></div>
                      )}
                      <div>
                        <p className='font-medium'>{transaction.description}</p>
                        <p className='text-sm text-gray-500'>
                          {transaction.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Overview

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount)
}
