import { Card, CardTitle, CardHeader } from '~/components/ui/card'
import Pointer from '/assets/icons/Pointer.svg?url'
import { ChartTooltipContent } from '~/components/ui/charts'
import { Budget } from '~/types/finance.types'
import { transformBudgetsToChart } from '~/transformers/budgetTransformer'
import { useMemo } from 'react'
import { ClientOnly } from 'remix-utils/client-only'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

interface BudgetPieChartProps {
  budgets: Budget[]
  title?: string
  showAllCategories?: boolean
  chartSize?: 'sm' | 'lg'
  showHeader?: boolean
}

// Simple component that directly imports recharts
const ChartContent = ({
  chartData,
  dimensions,
}: {
  chartData: any[]
  dimensions: {
    containerSize: string
    outerRadius: number
    innerRadius: number
  }
}) => {
  return (
    <ClientOnly
      fallback={
        <div className='w-full h-full flex items-center justify-center'>
          Loading chart...
        </div>
      }
    >
      {() => (
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
              animationBegin={0}
              animationDuration={500}
              animationEasing='ease-out'
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-outer-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              content={
                <ChartTooltipContent
                  formatter={(value: number) => formatCurrency(value)}
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ClientOnly>
  )
}

// Move this function to the top level for reuse
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
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

  const { chartData: allChartData, formattedTotal } = useMemo(
    () => transformBudgetsToChart(budgets),
    [budgets]
  )

  const chartData = useMemo(
    () => (showAllCategories ? allChartData : allChartData.slice(0, 4)),
    [allChartData, showAllCategories]
  )

  const { formattedSpentAmount } = useMemo(() => {
    const spent = budgets.reduce((total, budget) => {
      const spentAmount =
        budget.transactions?.reduce(
          (sum, transaction) => sum + Math.abs(transaction.amount),
          0
        ) ?? 0
      return total + spentAmount
    }, 0)

    return {
      totalSpent: spent,
      formattedSpentAmount: formatCurrency(spent),
    }
  }, [budgets])

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

  const ChartWrapper = () => (
    <div className='flex justify-center'>
      <div className={`relative flex-shrink-0 ${dimensions.containerSize}`}>
        <ClientOnly
          fallback={
            <div className='w-full h-full flex items-center justify-center'>
              Loading chart...
            </div>
          }
        >
          {() => <ChartContent chartData={chartData} dimensions={dimensions} />}
        </ClientOnly>

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
    return <ChartWrapper />
  }

  return (
    <Card className='p-[32px] flex flex-col gap-4 shadow-none'>
      <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
        <CardTitle className='text-[20px]'>{title}</CardTitle>
        <div className='text-[14px] text-gray-500 cursor-pointer hover:text-black transition-colors flex flex-row gap-1 items-center'>
          See Details
          <span className='flex items-center'>
            <img src={Pointer} alt='Pointer Icon' className={`h-2 w-2 ml-2`} />
          </span>
        </div>
      </CardHeader>

      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex justify-center sm:justify-start'>
          <ChartWrapper />
        </div>

        <div className='hidden sm:flex flex-1 flex-col justify-center gap-4 pl-4'>
          <BudgetItems />
        </div>
      </div>

      <div className='sm:hidden grid grid-cols-2 gap-4 mt-4'>
        <BudgetItems />
      </div>
    </Card>
  )
}
