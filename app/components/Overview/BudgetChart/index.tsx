import { Card, CardTitle, CardHeader } from '~/components/ui/card'
import Pointer from '../../../../public/assets/icons/Pointer.svg'
import { ChartTooltipContent } from '~/components/ui/charts'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Budget } from '~/types/finance.types'
import { transformBudgetsToChart } from '~/transformers/budgetTransformer'

interface BudgetChartProps {
  budgets: Budget[]
  title?: string
}

const BudgetChart: React.FC<BudgetChartProps> = ({
  budgets,
  title = 'Budget Allocation',
}) => {
  if (!budgets || budgets.length === 0) {
    return null
  }

  const { chartData, formattedTotal, total } = transformBudgetsToChart(budgets)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Calculate spent amount (for this demo, we'll use a percentage of the budget)
  const spentAmount = Math.round(total * 0.35) // 35% of total budget for demo purposes
  const formattedSpentAmount = formatCurrency(spentAmount)
  const formattedLimit = formatCurrency(total)

  // Helper function to create lighter and darker shades
  const getLighterShade = (color: string, percent: number = 30): string => {
    // For simplicity, assuming color is in hex format '#RRGGBB'
    // In a real app, you might want to use a color library
    if (!color.startsWith('#')) return color

    const hex = color.slice(1)
    // Convert hex to rgb
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    // Lighten
    const lighter = (value: number) =>
      Math.min(255, value + Math.round((255 - value) * (percent / 100)))

    // Convert back to hex
    return `#${lighter(r).toString(16).padStart(2, '0')}${lighter(g)
      .toString(16)
      .padStart(2, '0')}${lighter(b).toString(16).padStart(2, '0')}`
  }

  // Budget items component that can be reused in different layouts
  const BudgetItems = () => (
    <>
      {chartData.slice(0, 4).map((category, index) => (
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
          <div className='relative flex-shrink-0 w-[220px] h-[220px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                {/* Define gradients for each slice */}
                <defs>
                  {chartData.map((entry, index) => (
                    <radialGradient
                      key={`gradient-${index}`}
                      id={`gradient-${index}`}
                      cx='50%'
                      cy='50%'
                      r='50%'
                      fx='50%'
                      fy='50%'
                    >
                      <stop
                        offset='0%'
                        stopColor={getLighterShade(entry.fill, 40)}
                      />
                      <stop offset='75%' stopColor={entry.fill} />
                      <stop offset='100%' stopColor={entry.fill} />
                    </radialGradient>
                  ))}
                </defs>

                {/* Shadow effect - outer pie */}
                <Pie
                  data={chartData}
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  outerRadius={100}
                  innerRadius={70}
                  paddingAngle={2}
                  stroke='none'
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-outer-${index}`}
                      fill={`url(#gradient-${index})`}
                    />
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
                of {formattedLimit} limit
              </p>
            </div>
          </div>
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

export default BudgetChart
