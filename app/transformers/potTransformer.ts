import { Pot } from '~/types/finance.types'

export function transformPotsToOverview(pots: Pot[]) {
  if (!pots || !Array.isArray(pots)) {
    console.log(
      'WARNING: Non-array or null pots received in transformPotsToOverview'
    )
    // Return a safe default value instead of throwing an error
    return {
      formattedTotal: '£0.00',
    }
  }

  if (pots.length === 0) {
    console.log('INFO: Empty pots array received in transformPotsToOverview')
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
