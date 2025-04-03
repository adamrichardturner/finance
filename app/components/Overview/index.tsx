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
  balance: number // Main account balance
  potsBalance: number // Total in savings pots
  totalBalance: number // Combined total (balance + potsBalance)
  income: number
  expenses: number
  pots: Pot[]
  budgets: Budget[]
  transactions: AppTransaction[]
}

const Overview: React.FC<OverviewProps> = ({
  balance,
  potsBalance,
  totalBalance,
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

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) {
      return '£0.00'
    }
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className='w-full mb-12 sm:mt-[0px] sm:my-[0px]'>
      <PageTitle title='Overview' />
      <div className='flex flex-col gap-[32px]'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-[24px]'>
          <div>
            <Pill
              title='Main Account'
              amount={formatCurrency(balance)}
              isTotal={true}
              subtitle={`Savings: ${formatCurrency(potsBalance)}`}
            />
          </div>
          <div>
            <Pill title='Income' amount={formatCurrency(income)} />
          </div>
          <div>
            <Pill title='Expenses' amount={formatCurrency(expenses)} />
          </div>
        </div>
        <div className='flex flex-col max-[1457px]:flex-col min-[1457px]:grid min-[1457px]:grid-cols-12 gap-[32px]'>
          <div className='w-full min-[1457px]:col-span-7 flex flex-col gap-[32px]'>
            <div>
              <Pots pots={pots} />
            </div>

            <div
              onClick={() => handleNavigate('/transactions')}
              className='cursor-pointer'
            >
              <TransactionsOverview transactions={transactions} />
            </div>
          </div>

          <div className='w-full min-[1457px]:col-span-5 flex flex-col gap-[32px]'>
            <div
              onClick={() => handleNavigate('/budgets')}
              className='cursor-pointer'
            >
              <BudgetChart budgets={budgets} />
            </div>

            <div className='flex-1'>
              <RecurringBills bills={transactions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview
