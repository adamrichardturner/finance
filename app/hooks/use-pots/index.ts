import { usePotsData } from './use-pots-data'
import { usePotMutations } from '../use-pot-mutations'

export { usePotsData, usePotMutations }

// Main hook that combines data fetching with mutations
export function usePots() {
  const { data: pots, isLoading, error, refetch } = usePotsData()
  const mutations = usePotMutations()

  return {
    pots,
    isLoading,
    error,
    refetch,
    ...mutations,
  }
}
