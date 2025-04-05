import { useQuery } from '@tanstack/react-query'
import { useFinancialData } from '../use-overview/use-financial-data'
import { Transaction } from '~/types/finance.types'
import { useFactories } from '~/factories'

const fetchTransactionsFromJson = async () => {
  try {
    const response = await fetch('/data.json')
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON data: ${response.statusText}`)
    }
    const data = await response.json()
    return data.transactions || []
  } catch (err) {
    console.error('Error fetching from JSON:', err)
    return []
  }
}

const fetchTransactionsDirectly = async () => {
  try {
    const response = await fetch('/api/financial-data')
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`)
    }
    const data = await response.json()
    return data.transactions || []
  } catch (err) {
    console.error('Error fetching transactions directly:', err)
    return []
  }
}

export function useTransactionsQuery() {
  const { financialData } = useFinancialData()
  const { transactions: transactionFactory } = useFactories()

  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      // Process transactions from financial data first if available
      if (financialData?.transactions?.length > 0) {
        return financialData.transactions.map((tx: Transaction) =>
          transactionFactory.fromRaw(tx)
        )
      }

      // Try the API endpoint next
      const apiData = await fetchTransactionsDirectly()
      if (apiData && apiData.length > 0) {
        return apiData.map((tx: Transaction) => transactionFactory.fromRaw(tx))
      }

      // Fall back to JSON data
      const jsonData = await fetchTransactionsFromJson()
      return jsonData.map((tx: Transaction) => transactionFactory.fromRaw(tx))
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  })
}
