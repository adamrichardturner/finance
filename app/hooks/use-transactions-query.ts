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

// Direct fetch function - used as a fallback
async function fetchTransactionsDirectly(): Promise<AppTransaction[]> {
  console.log('Fetching transactions directly')
  try {
    const response = await fetch('/api/financial-data')
    if (!response.ok) {
      throw new Error(`Failed to fetch financial data: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.transactions && data.transactions.length > 0) {
      console.log(`Fetched ${data.transactions.length} transactions directly`)
      return data.transactions.map(transformToAppTransaction)
    }
  } catch (err) {
    console.error('Error fetching transactions directly:', err)
  }

  return []
}

export function useTransactionsQuery() {
  const { financialData, loading, error } = useFinancialData()

  // Log info about the financial data for debugging
  console.log('useTransactionsQuery - Financial data info:', {
    transactionCount: financialData?.transactions?.length || 0,
    isLoading: loading,
    hasError: !!error,
  })

  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      // Use transactions from financial data if available
      if (financialData?.transactions?.length > 0) {
        console.log(
          `Using ${financialData.transactions.length} transactions from financial data hook`
        )
        return financialData.transactions.map(transformToAppTransaction)
      }

      // Otherwise, fetch directly as a fallback
      return fetchTransactionsDirectly()
    },
    // Always run this query, don't wait for loading state
    enabled: true,
    // Never use cached data for this query, always run the queryFn
    refetchOnMount: true,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
  })
}
