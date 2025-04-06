import { Budget } from '~/types/finance.types'
import { BudgetPieChart } from '~/components/ui/charts/BudgetPieChart'
import { EXCLUDED_BUDGET_CATEGORIES } from '~/utils/budget-categories'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { PlusCircle } from 'lucide-react'

interface BudgetChartProps {
  budgets: Budget[]
  title?: string
}

const BudgetChart: React.FC<BudgetChartProps> = ({
  budgets,
  title = 'Budgets',
}) => {
  if (!budgets || budgets.length === 0) {
    return (
      <Card className='p-[32px] flex flex-col gap-4 shadow-none'>
        <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
          <CardTitle className='text-[20px]'>{title}</CardTitle>
          <div
            className='text-[14px] text-gray-500 cursor-pointer hover:text-black transition-colors flex flex-row gap-1 items-center'
            role='button'
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                window.location.href = '/budgets'
              }
            }}
            onClick={() => (window.location.href = '/budgets')}
          >
            See Details
            <span className='flex items-center'>
              <img
                src='/assets/icons/Pointer.svg'
                alt='Pointer Icon'
                className='h-2 w-2 ml-2'
              />
            </span>
          </div>
        </CardHeader>
        <CardContent className='p-0 mt-4'>
          <div className='flex flex-col items-center justify-center h-[260px] text-center'>
            <PlusCircle className='w-12 h-12 text-gray-300 mb-3' />
            <p className='text-gray-500 font-medium'>No budgets available</p>
            <p className='text-gray-400 text-sm mt-1'>
              Create budgets to track and manage your spending
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const expenseBudgets = budgets.filter(
    (budget) =>
      !EXCLUDED_BUDGET_CATEGORIES.map((cat) => cat.toLowerCase()).includes(
        budget.category.toLowerCase()
      )
  )

  if (expenseBudgets.length === 0) {
    return (
      <Card className='p-[32px] flex flex-col gap-4 shadow-none'>
        <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
          <CardTitle className='text-[20px]'>{title}</CardTitle>
          <div
            className='text-[14px] text-gray-500 cursor-pointer hover:text-black transition-colors flex flex-row gap-1 items-center'
            role='button'
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                window.location.href = '/budgets'
              }
            }}
            onClick={() => (window.location.href = '/budgets')}
          >
            See Details
            <span className='flex items-center'>
              <img
                src='/assets/icons/Pointer.svg'
                alt='Pointer Icon'
                className='h-2 w-2 ml-2'
              />
            </span>
          </div>
        </CardHeader>
        <CardContent className='p-0 mt-4'>
          <div className='flex flex-col items-center justify-center h-[220px] text-center'>
            <PlusCircle className='w-12 h-12 text-gray-300 mb-3' />
            <p className='text-gray-500 font-medium'>
              No expense budgets found
            </p>
            <p className='text-gray-400 text-sm mt-1'>
              Create expense budgets to visualize your spending
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <BudgetPieChart
      budgets={expenseBudgets}
      title={title}
      showAllCategories={false}
      chartSize='sm'
      showHeader={true}
    />
  )
}

export default BudgetChart
