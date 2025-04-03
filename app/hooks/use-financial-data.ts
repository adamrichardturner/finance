import { useQuery } from '@tanstack/react-query'
import { FinancialData } from '~/types/finance.types'

const initialFinancialData: FinancialData = {
  balance: {
    current: 0,
    income: 0,
    expenses: 0,
  },
  transactions: [],
  budgets: [],
  pots: [],
  bills: [],
}

async function fetchFinancialData(): Promise<FinancialData> {
  const response = await fetch('/api/financial-data')

  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

export function useFinancialData() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['financialData'],
    queryFn: fetchFinancialData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,

    placeholderData: initialFinancialData,

    retry: 3,
    retryDelay: (attempt: number) =>
      Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
  })

  return {
    financialData: data || initialFinancialData,
    loading: isLoading,
    error:
      error instanceof Error
        ? error
        : error
          ? new Error('Unknown error')
          : null,
  }
}
