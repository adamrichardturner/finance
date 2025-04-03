import { useQuery } from '@tanstack/react-query'
import { useFinancialData } from './use-financial-data'
import { AppTransaction } from '~/utils/transform-data'
import { Transaction } from '~/types/finance.types'
import { processAvatarPath } from '~/utils/avatar-utils'

// Transform Transaction to AppTransaction
function transformToAppTransaction(transaction: Transaction): AppTransaction {
  return {
    id:
      transaction.id?.toString() || Math.random().toString(36).substring(2, 9),
    date:
      transaction.date instanceof Date
        ? transaction.date.toISOString().split('T')[0]
        : new Date(transaction.date).toISOString().split('T')[0],
    description: transaction.name,
    amount: transaction.amount,
    type: transaction.amount > 0 ? 'income' : 'expense',
    category: transaction.category,
    avatar: processAvatarPath(transaction.avatar),
  }
}

// Get data directly from API endpoint
const fetchTransactionsDirectly = async () => {
  try {
    const response = await fetch('/api/transactions')
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`)
    }
    const data = await response.json()
    return data
  } catch (err) {
    console.error('Error fetching transactions directly:', err)
    throw err
  }
}

export function useTransactionsQuery() {
  const { financialData, loading, error } = useFinancialData()

  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      // Use transactions from financial data if available
      if (financialData?.transactions?.length > 0) {
        return financialData.transactions.map(transformToAppTransaction)
      }

      // Otherwise, fetch directly as a fallback
      const data = await fetchTransactionsDirectly()
      return Array.isArray(data) ? data.map(transformToAppTransaction) : []
    },
    // Always run this query, don't wait for loading state
    enabled: true,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
  })
}
