import { useMemo } from 'react'
import { Pot } from '~/types/finance.types'

export interface UsePotFiltersProps {
  pots: Pot[] | undefined
  filter?: string
}

export interface UsePotFiltersResult {
  filteredPots: Pot[]
  totalTarget: number
  totalSaved: number
  progressPercentage: number
  remainingToSave: number
}

/**
 * Hook for filtering and calculating pot statistics
 */
export function usePotFilters({
  pots,
  filter,
}: UsePotFiltersProps): UsePotFiltersResult {
  const {
    filteredPots,
    totalTarget,
    totalSaved,
    progressPercentage,
    remainingToSave,
  } = useMemo(() => {
    if (!pots || pots.length === 0) {
      return {
        filteredPots: [],
        totalTarget: 0,
        totalSaved: 0,
        progressPercentage: 0,
        remainingToSave: 0,
      }
    }

    // Apply filter if provided (e.g., name filter)
    const filtered = filter
      ? pots.filter((pot) =>
          pot.name.toLowerCase().includes(filter.toLowerCase())
        )
      : pots

    // Calculate totals
    const totalTargetAmount = filtered.reduce((sum, pot) => sum + pot.target, 0)
    const totalSavedAmount = filtered.reduce((sum, pot) => sum + pot.total, 0)
    const remaining = totalTargetAmount - totalSavedAmount
    const progress =
      totalTargetAmount > 0 ? (totalSavedAmount / totalTargetAmount) * 100 : 0

    return {
      filteredPots: filtered,
      totalTarget: totalTargetAmount,
      totalSaved: totalSavedAmount,
      progressPercentage: progress,
      remainingToSave: remaining,
    }
  }, [pots, filter])

  return {
    filteredPots,
    totalTarget,
    totalSaved,
    progressPercentage,
    remainingToSave,
  }
}
