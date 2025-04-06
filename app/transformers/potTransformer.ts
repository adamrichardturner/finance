import { Pot } from '~/types/finance.types'

export function transformPotsToOverview(pots: Pot[]) {
  if (!pots || !Array.isArray(pots)) {
    // Return a safe default value instead of throwing an error
    return {
      formattedTotal: '£0.00',
    }
  }

  if (pots.length === 0) {
    return {
      formattedTotal: '£0.00',
    }
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
