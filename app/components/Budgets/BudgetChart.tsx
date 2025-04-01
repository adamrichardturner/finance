import { Budget } from '~/types/finance.types'

interface BudgetChartProps {
  budgets: Budget[]
}

export function BudgetChart({ budgets }: BudgetChartProps) {
  const totalSpent = budgets.reduce((total, budget) => {
    const spentAmount =
      budget.transactions?.reduce(
        (sum, transaction) => sum + Math.abs(transaction.amount),
        0
      ) ?? 0
    return total + spentAmount
  }, 0)

  // Calculate the circumference of the circle
  const radius = 100
  const circumference = 2 * Math.PI * radius
  const strokeWidth = 30
  const gap = 2 // Gap between segments in degrees

  return (
    <div className='space-y-6'>
      <div className='flex justify-center'>
        <div className='relative h-[300px] w-[300px]'>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <span className='text-2xl font-bold'>
                £{totalSpent.toFixed(2)}
              </span>
              <p className='text-sm text-gray-500'>of total spent</p>
            </div>
          </div>
          <svg
            className='h-full w-full transform'
            viewBox='0 0 300 300'
            style={{ transform: 'rotate(-90deg) scale(0.9)' }}
          >
            {budgets.map((budget, index) => {
              const spentAmount =
                budget.transactions?.reduce(
                  (total, transaction) => total + Math.abs(transaction.amount),
                  0
                ) ?? 0

              // Calculate percentage with gap
              const rawPercentage = (spentAmount / totalSpent) * 100
              const gapAdjustedPercentage = Math.max(
                0,
                rawPercentage - (gap / 360) * 100
              )

              // Calculate offset for positioning
              const offset = budgets.slice(0, index).reduce((total, b) => {
                const spent =
                  b.transactions?.reduce(
                    (sum, t) => sum + Math.abs(t.amount),
                    0
                  ) ?? 0
                return total + (spent / totalSpent) * 100 + (gap / 360) * 100
              }, 0)

              return (
                <circle
                  key={budget.id}
                  cx='150'
                  cy='150'
                  r={radius}
                  fill='none'
                  stroke={budget.theme}
                  strokeWidth={strokeWidth}
                  strokeLinecap='round'
                  strokeDasharray={`${(gapAdjustedPercentage / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-(offset / 100) * circumference}
                  className='transition-all duration-300'
                />
              )
            })}
          </svg>
        </div>
      </div>

      <div className='space-y-3'>
        {budgets.map((budget) => {
          const spentAmount =
            budget.transactions?.reduce(
              (total, transaction) => total + Math.abs(transaction.amount),
              0
            ) ?? 0
          const maximum = parseFloat(budget.maximum)

          return (
            <div key={budget.id} className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div
                  className='h-2 w-2 rounded-full'
                  style={{ backgroundColor: budget.theme }}
                />
                <span className='text-sm'>{budget.category}</span>
              </div>
              <span className='text-sm text-gray-500'>
                £{spentAmount.toFixed(2)} of £{maximum.toFixed(2)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
