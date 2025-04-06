import { useCallback } from 'react'
import { AppTransaction } from '~/utils/transform-data'
import { format } from 'date-fns'
import { renderAvatar } from '~/utils/avatar-utils'

export interface TransactionFormattingResult {
  formatCurrency: (amount: number) => string
  formatTransactionDate: (dateString: string) => string
  isOverAMonthOld: (dateString: string) => boolean
  renderTransactionAvatar: (transaction: AppTransaction) => JSX.Element
}

/**
 * Hook for formatting transaction data
 */
export function useTransactionFormatting(): TransactionFormattingResult {
  // Format currency with the proper locale and symbol
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(Math.abs(amount))
  }, [])

  // Check if date is over a month old - keeping this for potential future use
  const isOverAMonthOld = useCallback((dateString: string): boolean => {
    const date = new Date(dateString)
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    return date < oneMonthAgo
  }, [])

  // Format transaction date - always use dd/MM/yyyy format
  const formatTransactionDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString)
      return format(date, 'dd/MM/yyyy')
    } catch (error) {
      return 'Invalid date'
    }
  }, [])

  // Render avatar for transaction
  const renderTransactionAvatar = useCallback(
    (transaction: AppTransaction): JSX.Element => {
      return renderAvatar(transaction.description, transaction.avatar, 40)
    },
    []
  )

  return {
    formatCurrency,
    formatTransactionDate,
    isOverAMonthOld,
    renderTransactionAvatar,
  }
}
