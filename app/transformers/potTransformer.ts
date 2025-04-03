import { Pot } from '~/types/finance.types'

export function transformPotsToOverview(pots: Pot[]) {
  if (!pots || pots.length <= 0) {
    throw new Error('invalid pots argument supplied to transformer')
  }

  const totalAllPots = pots.reduce((sum, pot) => sum + Number(pot.total), 0)
  const formattedTotal = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(totalAllPots)

  return {
    formattedTotal,
  }
}
