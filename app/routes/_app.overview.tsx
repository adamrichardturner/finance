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
    avatar:
      transaction.avatar ||
      `/assets/icons/${transaction.amount > 0 ? 'salary' : 'expense'}.svg`,
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

  // Calculate totals with safeguards
  let balance = 0
  try {
    balance =
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
    console.error('Error calculating balance:', err)
  }

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

  console.log('Calculated values:', { balance, income, expenses })

  return {
    balance,
    income,
    expenses,
    pots,
    budgets,
    transactions: appTransactions,
  }
}

export default function OverviewRoute() {
  const { pots, budgets, balance, income, expenses, transactions } =
    useLoaderData<typeof loader>()

  return (
    <Overview
      pots={pots as Pot[]}
      budgets={budgets as Budget[]}
      transactions={transactions as AppTransaction[]}
      balance={balance}
      income={income}
      expenses={expenses}
    />
  )
}
