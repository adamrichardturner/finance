import { useQuery } from '@tanstack/react-query'
import { Budget } from '~/types/finance.types'

/**
 * Hook for fetching budget data
 */
export function useBudgetsData() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await fetch('/budgets?index')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch budgets')
      }
      const data = await response.json()
      return data.budgets as Budget[]
    },
  })
}
