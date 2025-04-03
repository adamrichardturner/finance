import { Budget } from '~/types/finance.types'
import { BudgetPieChart } from '~/components/ui/charts/BudgetPieChart'
import { EXCLUDED_BUDGET_CATEGORIES } from '~/utils/budget-categories'

interface BudgetChartProps {
  budgets: Budget[]
  title?: string
}

const BudgetChart: React.FC<BudgetChartProps> = ({
  budgets,
  title = 'Budgets',
}) => {
  if (!budgets || budgets.length === 0) {
    return null
  }

  // Filter out Income budgets
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
