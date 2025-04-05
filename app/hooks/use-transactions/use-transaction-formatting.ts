import { useCallback } from 'react'
import { AppTransaction } from '~/utils/transform-data'
import { format, formatDistanceToNow, subMonths } from 'date-fns'
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

  // Check if date is over a month old
  const isOverAMonthOld = useCallback((dateString: string): boolean => {
    const date = new Date(dateString)
    const oneMonthAgo = subMonths(new Date(), 1)
    return date < oneMonthAgo
  }, [])

  // Format transaction date based on age
  const formatTransactionDate = useCallback(
    (dateString: string): string => {
      const date = new Date(dateString)

      if (isOverAMonthOld(dateString)) {
        return format(date, 'dd/MM/yyyy')
      }

      return formatDistanceToNow(date, { addSuffix: true })
    },
    [isOverAMonthOld]
  )

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
