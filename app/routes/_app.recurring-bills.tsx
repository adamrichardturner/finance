import { type MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireUserId } from '../services/auth/session.server'
import {
  getFinancialDataByUserId,
  Transaction,
} from '../repositories/finance.repository'
import { AppTransaction } from '../utils/transform-data'
import RecurringBills from '../components/RecurringBills'

export const meta: MetaFunction = () => {
  return [
    { title: 'Recurring Bills | Finance App' },
    { name: 'description', content: 'Manage your recurring bills' },
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

  // Get date string safely
  const getDateString = (dateValue: string): string => {
    try {
      return new Date(dateValue).toISOString().split('T')[0]
    } catch (e) {
      return new Date().toISOString().split('T')[0]
    }
  }

  return {
    id:
      transaction.id?.toString() || Math.random().toString(36).substring(2, 9),
    date: getDateString(transaction.date),
    description: transaction.name,
    amount: transaction.amount,
    type: transaction.amount > 0 ? 'income' : 'expense',
    category: transaction.category,
    avatar: processAvatarPath(transaction.avatar),
    recurring: transaction.recurring || false,
    dueDay: transaction.dueDay || new Date(transaction.date).getDate(),
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = String(await requireUserId(request))

  // Get financial data from database
  const financialData = await getFinancialDataByUserId(userId)

  // Get all transactions
  const transactions = financialData.transactions || []

  // Filter for recurring transactions only
  const recurringTransactions = transactions
    .filter((transaction) => transaction.recurring === true)
    .map(transformToAppTransaction)

  // Calculate total of recurring bills (only negative amounts)
  const recurringBills = recurringTransactions.filter((tx) => tx.amount < 0)
  const totalBills = recurringBills.reduce(
    (total, tx) => total + Math.abs(tx.amount),
    0
  )

  // Get today's date
  const today = new Date()

  // For demo purposes, let's say bills before today are paid and after are upcoming
  const paidBillsList = recurringBills.filter(
    (bill) => new Date(bill.date) < today
  )
  const upcomingBillsList = recurringBills.filter(
    (bill) => new Date(bill.date) >= today
  )

  // Bills due within the next 5 days are considered "due soon"
  const fiveDaysFromNow = new Date(today)
  fiveDaysFromNow.setDate(today.getDate() + 5)
  const dueSoonBillsList = upcomingBillsList.filter(
    (bill) => new Date(bill.date) <= fiveDaysFromNow
  )

  // Calculate summary amounts
  const paidBills = paidBillsList.reduce(
    (total, tx) => total + Math.abs(tx.amount),
    0
  )
  const totalUpcoming = upcomingBillsList.reduce(
    (total, tx) => total + Math.abs(tx.amount),
    0
  )
  const dueSoon = dueSoonBillsList.reduce(
    (total, tx) => total + Math.abs(tx.amount),
    0
  )

  return {
    transactions: recurringTransactions.filter((tx) => tx.amount < 0),
    summary: {
      totalBills,
      paidBills,
      totalUpcoming,
      dueSoon,
      paidCount: paidBillsList.length,
      upcomingCount: upcomingBillsList.length,
      dueSoonCount: dueSoonBillsList.length,
    },
  }
}

export default function RecurringBillsRoute() {
  const { transactions, summary } = useLoaderData<typeof loader>()

  return <RecurringBills transactions={transactions} summary={summary} />
}
