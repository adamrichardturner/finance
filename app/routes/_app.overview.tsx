import { type MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import Overview from '~/components/Overview'
import { Budget, Pot, Transaction } from '~/types/finance.types'
import { AppTransaction } from '~/utils/transform-data'
import { requireUserId } from '~/services/auth/session.server'
import { getBudgets } from '~/models/budget.server'
import { getFinancialDataByUserId } from '~/repositories/finance.repository'
import { useMemo } from 'react'

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

  // Get budget data
  const budgets = await getBudgets(userId)

  // Get financial data
  const financialData = await getFinancialDataByUserId(userId)

  // Calculate main account balance and total pots balance
  const mainAccountBalance = Number(financialData.balance?.current || 0)

  // Define potsBalance in the loader scope
  let potsBalance = 0
  try {
    if (financialData?.pots && financialData.pots.length > 0) {
      potsBalance = financialData.pots.reduce((sum, pot) => {
        if (pot.total === undefined) {
          return sum
        }
        return sum + Number(pot.total)
      }, 0)
    }
  } catch (err) {
    console.error('Error calculating pots balance:', err)
  }

  // Calculate total income from current month
  let income = 0
  try {
    if (financialData?.transactions && financialData.transactions.length > 0) {
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      income = financialData.transactions
        .filter((transaction) => {
          const txDate = new Date(transaction.date)
          return (
            transaction.amount > 0 &&
            txDate.getMonth() === currentMonth &&
            txDate.getFullYear() === currentYear
          )
        })
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    }
  } catch (err) {
    console.error('Error calculating income:', err)
  }

  // Calculate total expenses from current month
  let expenses = 0
  try {
    if (financialData?.transactions && financialData.transactions.length > 0) {
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      expenses = financialData.transactions
        .filter((transaction) => {
          const txDate = new Date(transaction.date)
          return (
            transaction.amount < 0 &&
            txDate.getMonth() === currentMonth &&
            txDate.getFullYear() === currentYear
          )
        })
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
    }
  } catch (err) {
    console.error('Error calculating expenses:', err)
  }

  // The total balance is simply the main account balance
  const totalBalance = mainAccountBalance

  // Get transactions and transform them to AppTransaction format
  const appTransactions =
    financialData?.transactions?.map(transformToAppTransaction) || []

  return {
    balance: totalBalance,
    potsBalance,
    totalBalance: totalBalance + potsBalance,
    income,
    expenses,
    budgets,
    financialData,
    pots: financialData?.pots || [],
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
