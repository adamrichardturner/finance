import { useMemo, useState } from 'react'
import { AppTransaction } from '~/utils/transform-data'
import { GroupStrategyFactory } from '~/strategies/transactions'

export interface TransactionGroupingProps {
  transactions: AppTransaction[]
}

export interface TransactionGroupingResult {
  // Group by state
  groupBy: string | null
  setGroupBy: (groupOption: string | null) => void

  // Grouped data
  groupedTransactions: Record<string, AppTransaction[]> | null

  // Available grouping options
  availableGroupOptions: Array<{
    value: string
    label: string
  }>

  // Helper
  isGrouped: boolean
}

/**
 * Hook for grouping transaction data using the Strategy pattern
 */
export function useTransactionGrouping({
  transactions,
}: TransactionGroupingProps): TransactionGroupingResult {
  // Group state
  const [groupBy, setGroupBy] = useState<string | null>(null)

  // Get all available grouping strategies
  const availableGroupOptions = useMemo(() => {
    return GroupStrategyFactory.getAllStrategies().map((strategy) => ({
      value: strategy.groupName,
      label: strategy.displayName,
    }))
  }, [])

  // Apply the selected grouping strategy to transactions
  const groupedTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0 || !groupBy) {
      return null
    }

    // Get the appropriate grouping strategy based on the selected option
    const groupStrategy = GroupStrategyFactory.getStrategy(groupBy)

    if (!groupStrategy) {
      return null
    }

    // Execute the strategy on the transactions
    return groupStrategy.execute(transactions)
  }, [transactions, groupBy])

  return {
    groupBy,
    setGroupBy,
    groupedTransactions,
    availableGroupOptions,
    isGrouped: !!groupBy && !!groupedTransactions,
  }
}
