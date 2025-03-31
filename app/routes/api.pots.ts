import { data } from '@remix-run/node'
import { getFinancialData } from '~/services/finance/finance.service'

export const loader = async () => {
  try {
    const result = await getFinancialData()
    return data(result.pots)
  } catch (error) {
    console.error('Error fetching pots data:', error)
    throw data(
      {
        error: 'Failed to fetch pots data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
