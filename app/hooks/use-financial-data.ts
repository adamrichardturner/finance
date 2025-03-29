import { useState, useEffect } from 'react'
import { AppTransaction } from '~/utils/transform-data'

// Define types for financial data
export interface FinancialData {
  balance: number
  income: number
  expenses: number
  transactions: AppTransaction[]
  budgets: any[]
  pots: any[]
}

/**
 * Custom hook to fetch and manage financial data
 */
export function useFinancialData() {
  const [financialData, setFinancialData] = useState<FinancialData>({
    balance: 0,
    income: 0,
    expenses: 0,
    transactions: [],
    budgets: [],
    pots: [],
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Fetch data from the API endpoint
        const response = await fetch('/api/financial-data')

        if (!response.ok) {
          throw new Error(
            `Failed to fetch financial data: ${response.statusText}`
          )
        }

        const data = await response.json()

        setFinancialData({
          balance: data.balance || 0,
          income: data.income || 0,
          expenses: data.expenses || 0,
          transactions: data.transactions || [],
          budgets: data.budgets || [],
          pots: data.pots || [],
        })
      } catch (err) {
        console.error('Error loading financial data:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return { financialData, loading, error }
}
