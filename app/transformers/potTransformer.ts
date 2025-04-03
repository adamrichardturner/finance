import { Pot } from '~/types/finance.types'

export function transformPotsToOverview(pots: Pot[]) {
  if (!pots || pots.length <= 0) {
    throw new Error('invalid pots argument supplied to transformer')
  }

  const totalAllPots = pots.reduce((sum, pot) => sum + Number(pot.total), 0)
  const formattedTotal = `£${totalAllPots.toFixed(0)}`

  return {
    formattedTotal,
  }
}
