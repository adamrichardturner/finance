import { type MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import Overview from '~/components/Overview'
import { Budget, Pot, Transaction } from '~/types/finance.types'
import { AppTransaction } from '~/utils/transform-data'
import { requireUserId } from '~/services/auth/session.server'
import { getBudgets } from '~/models/budget.server'
import { getFinancialDataByUserId } from '~/repositories/finance.repository'

export const meta: MetaFunction = () => {
  return [
    { title: 'Finance Overview' },
    { name: 'description', content: 'View your financial overview' },
  ]
}

function transformToAppTransaction(transaction: Transaction): AppTransaction {
  // Process avatar path to handle relative paths correctly
  const processAvatarPath = (path?: string): string | undefined => {
    if (!path) {
      // Default fallback icons based on transaction type
      return transaction.amount > 0
        ? '/assets/icons/salary.svg'
        : '/assets/icons/expense.svg'
    }

    // If path starts with "./", remove it to make it relative to the public folder
    if (path.startsWith('./')) {
      return path.substring(2)
    }

    return path
  }

  return {
    id:
      transaction.id?.toString() || Math.random().toString(36).substring(2, 9),
    date:
      transaction.date instanceof Date
        ? transaction.date.toISOString().split('T')[0]
        : new Date(transaction.date).toISOString().split('T')[0],
    description: transaction.name,
    amount: transaction.amount,
    type: transaction.amount > 0 ? 'income' : 'expense',
    category: transaction.category,
    avatar: processAvatarPath(transaction.avatar),
    recurring: transaction.recurring || false,
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = String(await requireUserId(request))

  // Get real data from database
  const budgets = await getBudgets(userId)

  // Get additional financial data
  const financialData = await getFinancialDataByUserId(userId)
  console.log('Financial data:', JSON.stringify(financialData, null, 2))

  const transactions = financialData.transactions || []
  const pots = financialData.pots || []

  // Transform transactions to AppTransaction format
  const appTransactions = transactions.map(transformToAppTransaction)

  // Get the main account balance - ensure it's a number
  const mainAccountBalance = Number(financialData.balance?.current || 0)

  // Calculate the total in saving pots
  let potsTotalBalance = 0
  try {
    potsTotalBalance =
      Array.isArray(pots) && pots.length > 0
        ? pots.reduce((total: number, pot: Pot) => {
            if (pot?.total === undefined || pot?.total === null) {
              console.warn(`Found pot with undefined total:`, pot)
              return total
            }
            return total + (Number(pot.total) || 0)
          }, 0)
        : 0
  } catch (err) {
    console.error('Error calculating pots balance:', err)
  }

  // The total balance is simply the main account balance
  // We don't add pot balances because money in pots is already
  // deducted from the main balance when it's moved there
  const totalBalance = mainAccountBalance
  console.log('Balance calculation:', {
    mainAccountBalance,
    potsTotalBalance,
    totalBalance,
  })

  let income = 0
  try {
    income =
      Array.isArray(transactions) && transactions.length > 0
        ? transactions
            .filter((t: Transaction) => t?.amount > 0)
            .reduce(
              (total: number, t: Transaction) =>
                total + (Number(t.amount) || 0),
              0
            )
        : 0
  } catch (err) {
    console.error('Error calculating income:', err)
  }

  let expenses = 0
  try {
    expenses =
      Array.isArray(transactions) && transactions.length > 0
        ? transactions
            .filter((t: Transaction) => t?.amount < 0)
            .reduce(
              (total: number, t: Transaction) =>
                total + Math.abs(Number(t.amount) || 0),
              0
            )
        : 0
  } catch (err) {
    console.error('Error calculating expenses:', err)
  }

  console.log('Calculated values:', {
    mainBalance: totalBalance,
    potsTotal: potsTotalBalance,
    combinedTotal: totalBalance + potsTotalBalance,
    income,
    expenses,
  })

  return {
    balance: totalBalance,
    potsBalance: potsTotalBalance,
    totalBalance: totalBalance + potsTotalBalance,
    income,
    expenses,
    pots,
    budgets,
    transactions: appTransactions,
  }
}

export default function OverviewRoute() {
  const {
    pots,
    budgets,
    balance,
    potsBalance,
    totalBalance,
    income,
    expenses,
    transactions,
  } = useLoaderData<typeof loader>()

  return (
    <Overview
      pots={pots as Pot[]}
      budgets={budgets as Budget[]}
      transactions={transactions as AppTransaction[]}
      balance={balance}
      potsBalance={potsBalance}
      totalBalance={totalBalance}
      income={income}
      expenses={expenses}
    />
  )
}
