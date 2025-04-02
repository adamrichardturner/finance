import { Budget } from '~/types/finance.types'
import { BudgetPieChart } from '~/components/ui/charts/BudgetPieChart'

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

  return (
    <BudgetPieChart
      budgets={budgets}
      title={title}
      showAllCategories={false}
      chartSize='sm'
      showHeader={true}
    />
  )
}

export default BudgetChart
