import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pot } from '~/types/finance.types'

// Function to fetch pots data (if we had a separate API)
async function fetchPots(): Promise<Pot[]> {
  const response = await fetch('/api/pots')

  if (!response.ok) {
    throw new Error(`Failed to fetch pots: ${response.statusText}`)
  }

  return response.json()
}

// Function to update a pot
async function updatePot(pot: Pot): Promise<Pot> {
  const response = await fetch(`/api/pots/${pot.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pot),
  })

  if (!response.ok) {
    throw new Error(`Failed to update pot: ${response.statusText}`)
  }

  return response.json()
}

type Status = 'idle' | 'loading' | 'error' | 'success'

interface UsePotsOptions {
  pots: Pot[]
  useLiveFetching?: boolean
}

export function usePots({ pots, useLiveFetching = false }: UsePotsOptions) {
  const queryClient = useQueryClient()

  // For real-time fetch if needed
  const { data: fetchedPots } = useQuery({
    queryKey: ['pots'],
    queryFn: fetchPots,
    enabled: useLiveFetching,
    initialData: pots,
  })

  // For updating a pot
  const mutation = useMutation({
    mutationFn: updatePot,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['pots'] })
    },
  })

  const activePots = useLiveFetching ? fetchedPots : pots

  return {
    pots: activePots,
    status: mutation.isPending
      ? 'loading'
      : mutation.isError
        ? 'error'
        : mutation.isSuccess
          ? 'success'
          : 'idle',
    updatePot: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
