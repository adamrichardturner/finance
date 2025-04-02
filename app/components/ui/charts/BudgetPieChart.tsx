import { Card, CardTitle, CardHeader } from '~/components/ui/card'
import Pointer from '/assets/icons/Pointer.svg?url'
import { ChartTooltipContent } from '~/components/ui/charts'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Budget } from '~/types/finance.types'
import { transformBudgetsToChart } from '~/transformers/budgetTransformer'

interface BudgetPieChartProps {
  budgets: Budget[]
  title?: string
  showAllCategories?: boolean
  chartSize?: 'sm' | 'lg'
  showHeader?: boolean
}

export function BudgetPieChart({
  budgets,
  title = 'Budgets',
  showAllCategories = false,
  chartSize = 'sm',
  showHeader = true,
}: BudgetPieChartProps) {
  if (!budgets || budgets.length === 0) {
    return null
  }

  const {
    chartData: allChartData,
    formattedTotal,
    total,
  } = transformBudgetsToChart(budgets)

  // Take all categories or just top 4 based on prop
  const chartData = showAllCategories ? allChartData : allChartData.slice(0, 4)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Calculate spent amount from actual transactions
  const totalSpent = budgets.reduce((total, budget) => {
    const spentAmount =
      budget.transactions?.reduce(
        (sum, transaction) => sum + Math.abs(transaction.amount),
        0
      ) ?? 0
    return total + spentAmount
  }, 0)

  const formattedSpentAmount = formatCurrency(totalSpent)

  // Chart dimensions based on size prop
  const dimensions = {
    sm: {
      containerSize: 'w-[220px] h-[220px]',
      outerRadius: 100,
      innerRadius: 70,
    },
    lg: {
      containerSize: 'w-[300px] h-[300px]',
      outerRadius: 140,
      innerRadius: 100,
    },
  }[chartSize]

  // Budget items component that can be reused in different layouts
  const BudgetItems = () => (
    <>
      {chartData.map((category, index) => (
        <div key={index} className='flex items-center sm:justify-end gap-4'>
          <div
            className='w-1 h-[40px] rounded-full'
            style={{ backgroundColor: category.fill }}
          ></div>
          <div className='flex flex-col w-[92px]'>
            <span className='text-[12px] font-[400] text-[#696868]'>
              {category.name}
            </span>
            <span className='text-[14px] font-[700]'>
              {formatCurrency(category.value)}
            </span>
          </div>
        </div>
      ))}
    </>
  )

  const ChartContent = () => (
    <div className='flex justify-center'>
      <div className={`relative flex-shrink-0 ${dimensions.containerSize}`}>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={chartData}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='50%'
              outerRadius={dimensions.outerRadius}
              innerRadius={dimensions.innerRadius}
              paddingAngle={2}
              stroke='none'
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-outer-${index}`} fill={entry.fill} />
              ))}
            </Pie>

            <Tooltip
              content={<ChartTooltipContent formatter={formatCurrency} />}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text showing spent and limit */}
        <div className='absolute inset-0 flex flex-col items-center justify-center text-center'>
          <h3 className='text-[32px] font-bold leading-8'>
            {formattedSpentAmount}
          </h3>
          <p className='text-[14px] text-[#696868]'>
            of {formattedTotal} limit
          </p>
        </div>
      </div>
    </div>
  )

  if (!showHeader) {
    return <ChartContent />
  }

  return (
    <Card className='p-[32px] flex flex-col gap-4 shadow-none'>
      <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
        <CardTitle className='text-[20px]'>{title}</CardTitle>
        <div className='text-[14px] text-[#696868] font-[500] flex flex-row items-center justify-end gap-[12px]'>
          See Details
          <span>
            <img src={Pointer} alt='Pointer Icon' className={`h-2 w-2`} />
          </span>
        </div>
      </CardHeader>

      {/* Responsive layout container */}
      <div className='flex flex-col sm:flex-row gap-4'>
        {/* Chart section - centered on small screens */}
        <div className='flex justify-center sm:justify-start'>
          <ChartContent />
        </div>

        {/* Larger screens: Budget items to the right of the chart */}
        <div className='hidden sm:flex flex-1 flex-col justify-center gap-4 pl-4'>
          <BudgetItems />
        </div>
      </div>

      {/* Small screens: Budget items in a 2-column grid below the chart */}
      <div className='sm:hidden grid grid-cols-2 gap-4 mt-4'>
        <BudgetItems />
      </div>
    </Card>
  )
}
