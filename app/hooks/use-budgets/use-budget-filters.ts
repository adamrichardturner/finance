import { useMemo } from 'react'
import { Budget } from '~/types/finance.types'

export interface UseBudgetFiltersProps {
  budgets: Budget[] | undefined
  categoryFilter?: string
}

export interface UseBudgetFiltersResult {
  filteredBudgets: Budget[]
  totalBudget: number
  totalSpent: number
  remainingBudget: number
}

/**
 * Hook for filtering and calculating budget statistics
 */
export function useBudgetFilters({
  budgets,
  categoryFilter,
}: UseBudgetFiltersProps): UseBudgetFiltersResult {
  const { filteredBudgets, totalBudget, totalSpent, remainingBudget } =
    useMemo(() => {
      if (!budgets || budgets.length === 0) {
        return {
          filteredBudgets: [],
          totalBudget: 0,
          totalSpent: 0,
          remainingBudget: 0,
        }
      }

      // Apply category filter if provided
      const filtered = categoryFilter
        ? budgets.filter(
            (budget) =>
              budget.category.toLowerCase() === categoryFilter.toLowerCase()
          )
        : budgets

      // Calculate totals
      const total = filtered.reduce(
        (sum, budget) => sum + parseFloat(budget.maximum),
        0
      )

      const spent = filtered.reduce((sum, budget) => {
        const spentAmount =
          budget.transactions?.reduce(
            (txSum, transaction) => txSum + Math.abs(transaction.amount),
            0
          ) ?? 0
        return sum + spentAmount
      }, 0)

      return {
        filteredBudgets: filtered,
        totalBudget: total,
        totalSpent: spent,
        remainingBudget: total - spent,
      }
    }, [budgets, categoryFilter])

  return {
    filteredBudgets,
    totalBudget,
    totalSpent,
    remainingBudget,
  }
}
