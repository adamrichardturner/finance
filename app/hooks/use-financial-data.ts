import { useState, useEffect } from 'react'
import demoDataJson from '../lib/data.json'

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

// Create structured demo data from the JSON
const demoData: FinancialData = {
  balance: demoDataJson.balance.current,
  income: demoDataJson.balance.income,
  expenses: demoDataJson.balance.expenses,
  transactions: demoDataJson.transactions.slice(0, 10).map((tx) => ({
    id: Math.random().toString(36).substring(2, 9),
    date: new Date(tx.date).toISOString().slice(0, 10),
    description: tx.name,
    amount: tx.amount,
    type: tx.amount > 0 ? 'income' : 'expense',
    category: tx.category,
    avatar: tx.avatar,
  })),
  budgets: [],
  pots: [],
}

// Default financial data for non-demo users
const defaultFinancialData: FinancialData = {
  balance: 4836.92,
  income: 3814.25,
  expenses: 1700.5,
  transactions: [],
  budgets: [],
  pots: [],
}

/**
 * Custom hook to fetch and manage financial data based on the user type
 */
export function useFinancialData(
  isDemoUser: boolean,
  requestUrlOrRequest?: string | Request
) {
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
  const [monzoConnected, setMonzoConnected] = useState(false)

  useEffect(() => {
    // Synchronously set the demo data and return if we're in demo mode
    if (isDemoUser) {
      console.log('Using demo data:', demoData)
      setFinancialData(demoData)
      setLoading(false)
      return
    }

    // Just use default data for non-demo users in the browser
    console.log('Using default non-demo data')
    setFinancialData(defaultFinancialData)
    setLoading(false)
  }, [isDemoUser])

  return { financialData, loading, error, monzoConnected }
}
