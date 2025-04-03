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
    recurring: transaction.recurring,
    dueDay: transaction.dueDay,
    isPaid: transaction.isPaid,
    isOverdue: transaction.isOverdue,
  }
}

// Get data from JSON file as fallback
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

// Get data directly from API endpoint
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
    // Return empty array instead of throwing
    return []
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

      // Try fetching from API
      const apiData = await fetchTransactionsDirectly()
      if (apiData && apiData.length > 0) {
        return apiData.map(transformToAppTransaction)
      }

      // Fallback to JSON file
      const jsonData = await fetchTransactionsFromJson()
      return jsonData.map(transformToAppTransaction)
    },
    // Always run this query, don't wait for loading state
    enabled: true,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
    // Add retry options
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  })
}
