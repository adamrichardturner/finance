import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import PageTitle from '../PageTitle'
import Pill from './Pill'

interface OverviewProps {
  balance: number
  income: number
  expenses: number
}

const Overview: React.FC<OverviewProps> = ({ balance, income, expenses }) => {
  return (
    <div className='w-full'>
      <PageTitle title='Overview' />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <Pill
          title='Total Balance'
          amount={formatCurrency(balance)}
          icon={<DollarSignIcon className='text-blue-500' size={24} />}
        />
        <Pill
          title='Income'
          amount={formatCurrency(income)}
          icon={<TrendingUpIcon className='text-green-500' size={24} />}
        />
        <Pill
          title='Expenses'
          amount={formatCurrency(expenses)}
          icon={<TrendingDownIcon className='text-red-500' size={24} />}
        />
      </div>
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
