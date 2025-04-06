import { useQuery } from '@tanstack/react-query'
import { useFinancialData } from '../use-overview/use-financial-data'
import { Transaction } from '~/types/finance.types'
import { useFactories } from '~/factories'
import { AppTransaction } from '~/utils/transform-data'

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

// New function to fetch from our optimized transactions endpoint
const fetchTransactionsFromApi = async () => {
  try {
    const response = await fetch('/api/transactions')
    if (!response.ok) {
      throw new Error(
        `Failed to fetch from transactions API: ${response.statusText}`
      )
    }
    const data = await response.json()

    // Log what we got from the API
    if (data.transactions) {
      console.log(`Fetched ${data.transactions.length} transactions from API`)

      // Check for pot transactions
      const potTransactions = data.transactions.filter(
        (tx: AppTransaction) =>
          tx.category?.toLowerCase() === 'savings' ||
          tx.category?.toLowerCase() === 'withdrawal' ||
          tx.category?.toLowerCase() === 'return'
      )

      if (potTransactions.length > 0) {
        console.log(`API returned ${potTransactions.length} pot transactions`)
      } else {
        console.log('No pot transactions found in API response')
      }
    }

    return data.transactions || []
  } catch (err) {
    console.error('Error fetching from transactions API:', err)
    return []
  }
}

export function useTransactionsQuery() {
  const { financialData, refetch: refetchFinancialData } = useFinancialData()
  const { transactions: transactionFactory } = useFactories()

  const query = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      // Try our optimized transactions API endpoint first
      const apiTransactions = await fetchTransactionsFromApi()
      if (apiTransactions && apiTransactions.length > 0) {
        // Don't need to transform since the API already did that
        return apiTransactions
      }

      // Process transactions from financial data if API fails
      if (financialData?.transactions?.length > 0) {
        // Make sure we include pot-related transactions by logging them for debugging
        const potTransactions = financialData.transactions.filter(
          (tx) =>
            tx.category?.toLowerCase() === 'savings' ||
            tx.category?.toLowerCase() === 'withdrawal' ||
            tx.category?.toLowerCase() === 'return' ||
            tx.name?.toLowerCase().includes('pot') ||
            tx.name?.toLowerCase().includes('savings pot') ||
            tx.name?.toLowerCase().includes('transfer to pot') ||
            tx.name?.toLowerCase().includes('withdrawal from') ||
            tx.name?.toLowerCase().includes('returned funds')
        )

        // Log the found pot transactions for debugging
        if (potTransactions.length > 0) {
          console.log(
            'Pot transactions found in raw data:',
            potTransactions.length
          )
          console.log('Sample pot transaction:', potTransactions[0])
        } else {
          console.log('No pot transactions found in raw financial data')
        }

        const transformedTransactions = financialData.transactions.map(
          (tx: Transaction) => transactionFactory.fromRaw(tx)
        )

        // Check for pot transactions in the transformed data
        const transformedPotTransactions = transformedTransactions.filter(
          (tx) =>
            tx.category?.toLowerCase() === 'savings' ||
            tx.category?.toLowerCase() === 'withdrawal' ||
            tx.category?.toLowerCase() === 'return' ||
            tx.description?.toLowerCase().includes('pot') ||
            tx.description?.toLowerCase().includes('savings pot') ||
            tx.description?.toLowerCase().includes('transfer to pot') ||
            tx.description?.toLowerCase().includes('withdrawal from') ||
            tx.description?.toLowerCase().includes('returned funds')
        )

        if (transformedPotTransactions.length > 0) {
          console.log(
            'Pot transactions found after transform:',
            transformedPotTransactions.length
          )
          console.log(
            'Sample transformed pot transaction:',
            transformedPotTransactions[0]
          )
        } else {
          console.log('No pot transactions found after transform')
        }

        return transformedTransactions
      }

      // Try the direct API endpoint next
      const directApiData = await fetchTransactionsDirectly()
      if (directApiData && directApiData.length > 0) {
        return directApiData.map((tx: Transaction) =>
          transactionFactory.fromRaw(tx)
        )
      }

      // Fall back to JSON data
      const jsonData = await fetchTransactionsFromJson()
      return jsonData.map((tx: Transaction) => transactionFactory.fromRaw(tx))
    },
    enabled: true,
    staleTime: 30 * 1000, // Reduced to 30 seconds to ensure fresher data
    refetchOnWindowFocus: true, // Changed to true to refresh when window is focused
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  })

  // Add a function to manually refresh the transactions
  const refreshTransactions = async () => {
    await refetchFinancialData()
    return query.refetch()
  }

  return {
    ...query,
    refreshTransactions,
  }
}
