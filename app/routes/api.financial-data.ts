import { data } from '@remix-run/node'
import { getFinancialData } from '~/services/finance/finance.service'

export const loader = async () => {
  try {
    const result = await getFinancialData()

    // Log the transaction count
    console.log('API - Transaction count:', result.transactions.length)

    // Add sample transaction for testing if there are none
    if (!result.transactions || result.transactions.length === 0) {
      console.log('API - No transactions found, adding sample transaction')
      result.transactions = [
        {
          id: 1,
          avatar: '/assets/icons/bank.svg',
          name: 'Mortgage Payment',
          category: 'Housing',
          date: new Date().toISOString(),
          amount: -1200,
          recurring: true,
        },
      ]
    }

    return data(result)
  } catch (error) {
    console.error('Error fetching financial data:', error)
    throw data(
      {
        error: 'Failed to fetch financial data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
