import { Budget } from '~/types/finance.types'
import { BudgetPieChart } from '~/components/ui/charts/BudgetPieChart'
import { EXCLUDED_BUDGET_CATEGORIES } from '~/utils/budget-categories'

interface BudgetChartProps {
  budgets: Budget[]
}

export function BudgetChart({ budgets }: BudgetChartProps) {
  if (!budgets || budgets.length === 0) {
    return null
  }

  const expenseBudgets = budgets.filter(
    (budget) =>
      !EXCLUDED_BUDGET_CATEGORIES.map((cat) => cat.toLowerCase()).includes(
        budget.category.toLowerCase()
      )
  )

  if (expenseBudgets.length === 0) {
    return null
  }

  return (
    <div className='space-y-6'>
      <BudgetPieChart
        budgets={expenseBudgets}
        showAllCategories={true}
        chartSize='lg'
        showHeader={false}
      />

      <div className='space-y-3'>
        {expenseBudgets.map((budget, index) => {
          const spentAmount =
            budget.transactions?.reduce(
              (total, transaction) => total + Math.abs(transaction.amount),
              0
            ) ?? 0
          const maximum = parseFloat(budget.maximum)

          return (
            <div key={budget.id}>
              <div className='flex items-center justify-between min-h-[42px]'>
                <div className='flex items-center gap-2'>
                  <div
                    className='h-2 w-2 rounded-full'
                    style={{ backgroundColor: budget.theme }}
                  />
                  <span className='text-[14px] text-color-grey-500 font-[400]'>
                    {budget.category}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-color-grey-900 text-[16px] font-[700]'>
                    £{spentAmount.toFixed(2)}
                  </span>
                  <span className='text-sm text-color-grey-500 text-[12px] font-[400]'>
                    of £{maximum.toFixed(2)}
                  </span>
                </div>
              </div>
              {index < expenseBudgets.length - 1 && (
                <div
                  className='mt-3'
                  style={{
                    height: '1px',
                    width: '100%',
                    strokeWidth: '1px',
                    background: 'var(--color-grey-100, #F2F2F2)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
