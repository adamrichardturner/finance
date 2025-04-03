import { data } from '@remix-run/node'
import { getFinancialData } from '~/services/finance/finance.service'

export const loader = async () => {
  try {
    const result = await getFinancialData()
    const transactions = result.transactions || []

    return data({ transactions })
  } catch (error) {
    return data({ transactions: [] }, { status: 500 })
  }
}
