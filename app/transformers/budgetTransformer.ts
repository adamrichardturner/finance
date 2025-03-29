import { Budget } from '~/types/finance.types'

interface TransformedBudgetData {
  name: string
  value: number
  fill: string
}

export const transformBudgetsToChart = (
  budgets: Budget[]
): {
  chartData: TransformedBudgetData[]
  total: number
  formattedTotal: string
} => {
  if (!budgets || budgets.length === 0) {
    return {
      chartData: [],
      total: 0,
      formattedTotal: '£0',
    }
  }

  const total = budgets.reduce((sum, budget) => sum + budget.maximum, 0)

  const chartData = budgets.map((budget) => ({
    name: budget.category,
    value: budget.maximum,
    fill: budget.theme,
  }))

  const formattedTotal = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(total)

  return {
    chartData,
    total,
    formattedTotal,
  }
}
