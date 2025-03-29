import { useState } from 'react'
import { Pot } from '~/types/finance.types'

interface PotsProps {
  pots: Pot[]
}

type Status = 'loading' | 'submitting' | 'idle' | 'error'

interface PotState {
  status: Status
  original: {
    pots: Pot[]
  }
  current: {
    pots: Pot[]
  }
}

export function usePots({ pots }: PotsProps) {
  if (!pots) {
    throw new Error('jam sandwiches')
  }

  const [potState, setPotstate] = useState<PotState>({
    status: 'idle',
    original: {
      pots: pots,
    },
    current: {
      pots: pots,
    },
  })

  return {
    potState,
    setPotstate,
  }
}
