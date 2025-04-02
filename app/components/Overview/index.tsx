import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import PageTitle from '../PageTitle'
import Pill from './Pill'
import Pots from './Pots'
import BudgetChart from './BudgetChart'
import TransactionsOverview from './TransactionsOverview'
import RecurringBills from './RecurringBills'
import { Pot, Budget } from '~/types/finance.types'
import { AppTransaction } from '~/utils/transform-data'
import { useNavigate } from '@remix-run/react'

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
  const navigate = useNavigate()
  const handleNavigate = (path: string) => {
    navigate(path)
  }

  const hoverClass =
    'cursor-pointer hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-shadow duration-200'

  return (
    <div className='w-full mt-4 mb-12 sm:mt-[0px] sm:my-[0px]'>
      <PageTitle title='Overview' />
      <div className='flex flex-col gap-[32px]'>
        <div className='grid grid-cols-1 2xl:grid-cols-3 gap-[24px] md:hidden'>
          <div className={hoverClass}>
            <Pill
              title='Total Balance'
              amount={formatCurrency(balance)}
              icon={<DollarSignIcon className='text-blue-500' size={24} />}
            />
          </div>
          <div className={hoverClass}>
            <Pill
              title='Income'
              amount={formatCurrency(income)}
              icon={<TrendingUpIcon className='text-green-500' size={24} />}
            />
          </div>
          <div className={hoverClass}>
            <Pill
              title='Expenses'
              amount={formatCurrency(expenses)}
              icon={<TrendingDownIcon className='text-red-500' size={24} />}
            />
          </div>
        </div>
        <div className='flex flex-col max-[1457px]:flex-col min-[1457px]:grid min-[1457px]:grid-cols-12 gap-[32px]'>
          <div className='w-full min-[1457px]:col-span-7 flex flex-col gap-[32px]'>
            <div className={hoverClass}>
              <Pots pots={pots} />
            </div>

            <div
              className={hoverClass}
              onClick={() => handleNavigate('/transactions')}
            >
              <TransactionsOverview transactions={transactions} />
            </div>
          </div>

          <div className='w-full min-[1457px]:col-span-5 flex flex-col gap-[32px]'>
            <div
              className={hoverClass}
              onClick={() => handleNavigate('/budgets')}
            >
              <BudgetChart budgets={budgets} />
            </div>

            <div className={`${hoverClass} flex-1`}>
              <RecurringBills bills={transactions} />
            </div>
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
