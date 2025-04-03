import { data } from '@remix-run/node'
import { getFinancialData } from '~/services/finance/finance.service'

export const loader = async () => {
  try {
    const result = await getFinancialData()

    return data({ result })
  } catch (error) {
    return data({ result: null }, { status: 500 })
  }
}
