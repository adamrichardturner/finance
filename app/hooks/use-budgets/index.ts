import { useBudgetsData } from './use-budgets-data'
import { useBudgetMutations } from '../use-budget-mutations'

export { useBudgetsData, useBudgetMutations }

// Main hook that combines data fetching with mutations
export function useBudgets() {
  const { data: budgets, isLoading, error, refetch } = useBudgetsData()
  const mutations = useBudgetMutations()

  return {
    budgets,
    isLoading,
    error,
    refetch,
    ...mutations,
  }
}
