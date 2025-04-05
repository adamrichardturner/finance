import { useMemo } from 'react'
import { FinancialData, Transaction, Bill } from '~/types/finance.types'

export interface UseOverviewStatsProps {
  financialData: FinancialData
}

export interface UseOverviewStatsResult {
  totalIncome: number
  totalExpenses: number
  netCashflow: number
  savingsRate: number
  mostSpentCategory: {
    name: string
    amount: number
  } | null
  recentTransactions: Transaction[]
  upcomingBills: Bill[]
}

/**
 * Hook for calculating overview financial statistics
 */
export function useOverviewStats({
  financialData,
}: UseOverviewStatsProps): UseOverviewStatsResult {
  return useMemo(() => {
    const { transactions, bills, budgets } = financialData

    // Calculate total income
    const income = transactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0)

    // Calculate total expenses
    const expenses = transactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

    // Net cashflow
    const netCashflow = income - expenses

    // Savings rate (if income > 0)
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0

    // Find most spent category
    const spendingByCategory = transactions
      .filter((tx) => tx.amount < 0)
      .reduce(
        (acc, tx) => {
          const category = tx.category
          acc[category] = (acc[category] || 0) + Math.abs(tx.amount)
          return acc
        },
        {} as Record<string, number>
      )

    let mostSpentCategory = null
    let maxSpent = 0

    Object.entries(spendingByCategory).forEach(([category, amount]) => {
      if (amount > maxSpent) {
        maxSpent = amount
        mostSpentCategory = { name: category, amount }
      }
    })

    // Get recent transactions
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    // Get upcoming bills
    const upcomingBills = [...bills]
      .filter((bill) => !bill.isPaid && !bill.isOverdue)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netCashflow,
      savingsRate,
      mostSpentCategory,
      recentTransactions,
      upcomingBills,
    }
  }, [financialData])
}
