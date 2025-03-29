import { useState, useEffect } from 'react'
import demoData from '../../public/data.json'

// Define types for financial data
export interface FinancialData {
  balance: number
  income: number
  expenses: number
  transactions: Transaction[]
  budgets: any[]
  pots: any[]
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: string
  category: string
  avatar?: string
}

/**
 * Transform transaction data from the JSON format to our application format
 */
function transformTransaction(transaction: any): Transaction {
  return {
    id: Math.random().toString(36).substring(2, 9),
    date: new Date(transaction.date).toISOString().slice(0, 10),
    description: transaction.name,
    amount: transaction.amount,
    type: transaction.amount > 0 ? 'income' : 'expense',
    category: transaction.category,
    avatar: transaction.avatar,
  }
}

/**
 * Custom hook to fetch and manage financial data based on the user type
 */
export function useFinancialData(isDemoUser: boolean) {
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

        if (isDemoUser) {
          // Use the data from data.json for demo users
          const balance = demoData.balance.current
          const income = demoData.balance.income
          const expenses = demoData.balance.expenses

          // Transform transactions to our application format
          const transactions = demoData.transactions
            .slice(0, 10)
            .map(transformTransaction)

          setFinancialData({
            balance,
            income,
            expenses,
            transactions,
            budgets: demoData.budgets,
            pots: demoData.pots,
          })
        } else {
          // For regular users, fetch from database
          // For now, we'll use mock data
          setFinancialData({
            balance: 4836.92,
            income: 3814.25,
            expenses: 1700.5,
            transactions: [],
            budgets: [],
            pots: [],
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isDemoUser])

  return { financialData, loading, error }
}
