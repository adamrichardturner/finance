import { data } from '@remix-run/node'
import { getFinancialData } from '~/services/finance/finance.service'
import { TransactionFactory } from '~/factories/transaction.factory'
import { AppTransaction } from '~/utils/transform-data'

export const loader = async () => {
  try {
    // Get the transaction factory
    const transactionFactory = TransactionFactory.getInstance()

    // Get financial data which includes all transactions
    const financialData = await getFinancialData()

    // Ensure all transactions are properly processed with the factory
    const transactions = financialData.transactions.map((tx) =>
      transactionFactory.fromRaw(tx)
    )

    // Debug: count pot transactions
    const potTransactions = transactions.filter(
      (tx: AppTransaction) =>
        tx.category?.toLowerCase() === 'savings' ||
        tx.category?.toLowerCase() === 'withdrawal' ||
        tx.category?.toLowerCase() === 'return'
    )

    console.log(
      `API: Found ${potTransactions.length} pot transactions out of ${transactions.length} total`
    )

    return data({ transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return data({ transactions: [] }, { status: 500 })
  }
}
