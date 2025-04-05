import { useQuery } from '@tanstack/react-query'
import { Pot } from '~/types/finance.types'

/**
 * Fetches pots data from the API
 */
async function fetchPots(): Promise<Pot[]> {
  const response = await fetch('/api/pots')

  if (!response.ok) {
    throw new Error(`Failed to fetch pots: ${response.statusText}`)
  }

  return response.json()
}

export interface UsePotsDataOptions {
  initialPots?: Pot[]
  useLiveFetching?: boolean
}

/**
 * Hook for fetching pots data
 */
export function usePotsData({
  initialPots,
  useLiveFetching = true,
}: UsePotsDataOptions = {}) {
  return useQuery({
    queryKey: ['pots'],
    queryFn: fetchPots,
    enabled: useLiveFetching,
    initialData: initialPots,
  })
}
