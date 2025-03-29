interface ChartData {
  date: string
  income: number
  expenses: number
}

interface TransformedChartData {
  name: string
  value1: number
  value2: number
}

export const transformChartData = (
  data: ChartData[]
): { chartData: TransformedChartData[] } => {
  if (!data || data.length === 0) {
    return { chartData: [] }
  }

  const chartData = data.map((item) => ({
    name: item.date,
    value1: item.income,
    value2: item.expenses,
  }))

  return { chartData }
}
