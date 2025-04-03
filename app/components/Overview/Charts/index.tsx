import { Card, CardTitle, CardHeader } from '~/components/ui/card'
import Pointer from '/assets/icons/Pointer.svg?url'
import { ChartContainer, ChartTooltipContent } from '~/components/ui/charts'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ChartProps {
  data: Array<{
    name: string
    value1: number
    value2: number
  }>
  title: string
}

const CHART_COLORS = ['#47B4AC', '#F58A51']

const Charts: React.FC<ChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return null
  }

  const formatCurrency = (value: number) => {
    return `£${value.toLocaleString()}`
  }

  return (
    <Card className='p-[32px] flex flex-col gap-4 shadow-none'>
      <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
        <CardTitle className='text-[20px]'>{title}</CardTitle>
        <div className='text-[14px] text-gray-500 cursor-pointer hover:text-black transition-colors justify-between items-center flex flex-row gap-1'>
          See Details
          <span>
            <img src={Pointer} alt='Pointer Icon' className={`h-2 w-2 ml-2`} />
          </span>
        </div>
      </CardHeader>
      <ChartContainer className='h-[300px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray='3 3' vertical={false} />
            <XAxis
              dataKey='name'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#696868' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#696868' }}
              tickFormatter={(value) => `£${value}`}
            />
            <Tooltip
              content={<ChartTooltipContent formatter={formatCurrency} />}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Bar
              dataKey='value1'
              name='Income'
              fill={CHART_COLORS[0]}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey='value2'
              name='Expenses'
              fill={CHART_COLORS[1]}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  )
}

export default Charts
