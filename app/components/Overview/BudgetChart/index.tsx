import { Card, CardTitle, CardHeader } from '~/components/ui/card'
import Pointer from '../../../../public/assets/icons/Pointer.svg'
import PieIcon from '../../../../public/assets/icons/DollarJar.svg'
import { ChartContainer, ChartTooltipContent } from '~/components/ui/charts'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { cn } from '~/lib/utils'
import { Budget } from '~/types/finance.types'
import { transformBudgetsToChart } from '~/transformers/budgetTransformer'

interface BudgetChartProps {
  budgets: Budget[]
  title?: string
}

interface BudgetSummaryProps {
  total: string
  data: Array<{
    name: string
    value: number
    fill: string
  }>
}

const BudgetChart: React.FC<BudgetChartProps> = ({
  budgets,
  title = 'Budget Allocation',
}) => {
  if (!budgets || budgets.length === 0) {
    return null
  }

  const { chartData, formattedTotal } = transformBudgetsToChart(budgets)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
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
      <div className='flex flex-row gap-4'>
        <BudgetSummary total={formattedTotal} data={chartData} />
        <ChartContainer className='flex-1 h-[200px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={chartData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={<ChartTooltipContent formatter={formatCurrency} />}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  )
}

export default BudgetChart

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ total, data }) => {
  return (
    <div className='p-4 bg-[#F8F4F0] flex flex-col justify-between w-5/12 rounded-lg'>
      <div className='flex items-center mb-4'>
        <div>
          <img
            src={PieIcon}
            alt='Budget Icon'
            className={`h-[40px] w-[40px] mb-1`}
          />
        </div>
        <div className='pl-[16px]'>
          <span className='text-color-grey-500 text-[14px]'>Total Budget</span>
          <h3 className='text-[24px] font-semibold'>{total}</h3>
        </div>
      </div>
      <div className='flex flex-col space-y-3'>
        {data.slice(0, 4).map((item, index) => (
          <div key={index} className='flex items-center'>
            <span
              className={cn('w-3 h-3 rounded-full mr-2')}
              style={{ backgroundColor: item.fill }}
            />
            <div className='flex flex-col'>
              <div className='flex justify-between w-full'>
                <span className='text-[13px] text-[#696868]'>{item.name}</span>
                <span className='text-[13px] font-semibold'>
                  {new Intl.NumberFormat('en-GB', {
                    style: 'currency',
                    currency: 'GBP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(item.value)}
                </span>
              </div>
            </div>
          </div>
        ))}
        {data.length > 4 && (
          <div className='text-[12px] text-[#696868] italic'>
            +{data.length - 4} more categories
          </div>
        )}
      </div>
    </div>
  )
}
