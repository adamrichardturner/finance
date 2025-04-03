import { data } from '@remix-run/node'
import { getFinancialData } from '~/services/finance/finance.service'

export const loader = async () => {
  try {
    const result = await getFinancialData()

    // Ensure we have transactions and they're properly formatted
    const transactions = result.transactions || []

    // Log the transaction count
    console.log('API Transactions - Count:', transactions.length)

    return data(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)

    // Return empty array instead of error to prevent UI from breaking
    return data([])
  }
}
