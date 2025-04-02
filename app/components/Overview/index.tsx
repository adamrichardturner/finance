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

  return (
    <div className='w-full mb-12 sm:mt-[0px] sm:my-[0px]'>
      <PageTitle title='Overview' />
      <div className='flex flex-col gap-[32px]'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-[24px]'>
          <div>
            <Pill
              title='Total Balance'
              amount={formatCurrency(balance)}
              icon={<DollarSignIcon className='text-blue-500' size={24} />}
              isTotal={true}
            />
          </div>
          <div>
            <Pill
              title='Income'
              amount={formatCurrency(income)}
              icon={<TrendingUpIcon className='text-green-500' size={24} />}
            />
          </div>
          <div>
            <Pill
              title='Expenses'
              amount={formatCurrency(expenses)}
              icon={<TrendingDownIcon className='text-red-500' size={24} />}
            />
          </div>
        </div>
        <div className='flex flex-col max-[1457px]:flex-col min-[1457px]:grid min-[1457px]:grid-cols-12 gap-[32px]'>
          <div className='w-full min-[1457px]:col-span-7 flex flex-col gap-[32px]'>
            <div>
              <Pots pots={pots} />
            </div>

            <div onClick={() => handleNavigate('/transactions')}>
              <TransactionsOverview transactions={transactions} />
            </div>
          </div>

          <div className='w-full min-[1457px]:col-span-5 flex flex-col gap-[32px]'>
            <div onClick={() => handleNavigate('/budgets')}>
              <BudgetChart budgets={budgets} />
            </div>

            <div>
              <RecurringBills bills={transactions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview

function formatCurrency(amount: number | undefined | null) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '£0.00'
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount)
}
