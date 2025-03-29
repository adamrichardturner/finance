import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import PageTitle from '../PageTitle'
import Pill from './Pill'
import Pots from './Pots'
import Charts from './Charts'
import BudgetChart from './BudgetChart'
import TransactionsOverview from './TransactionsOverview'
import RecurringBills from './RecurringBills'
import { Pot, Budget, Transaction } from '~/types/finance.types'
import { AppTransaction } from '~/utils/transform-data'

interface OverviewProps {
  balance: number
  income: number
  expenses: number
  pots: Pot[]
  budgets: Budget[]
  transactions: AppTransaction[]
}

const Overview: React.FC<OverviewProps> = ({
  balance,
  income,
  expenses,
  pots,
  budgets,
  transactions,
}) => {
  // Sample chart data
  const chartData = [
    { name: 'Jan', value1: 2400, value2: 1800 },
    { name: 'Feb', value1: 1398, value2: 1200 },
    { name: 'Mar', value1: 9800, value2: 7200 },
    { name: 'Apr', value1: 3908, value2: 2900 },
    { name: 'May', value1: 4800, value2: 3800 },
    { name: 'Jun', value1: 3800, value2: 2800 },
  ]

  return (
    <div className='w-full'>
      <PageTitle title='Overview' />
      <div className='flex flex-col gap-[32px]'>
        {/* Pills - Equal width */}
        <div className='grid grid-cols-3 gap-[24px]'>
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

        {/* Two column layout */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-[24px]'>
          {/* Left column */}
          <div className='flex flex-col gap-[32px]'>
            <Pots pots={pots} />
            <TransactionsOverview transactions={transactions} />
          </div>

          {/* Right column */}
          <div className='flex flex-col gap-[32px]'>
            <BudgetChart budgets={budgets} />
            <RecurringBills bills={transactions} />
          </div>
        </div>
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
