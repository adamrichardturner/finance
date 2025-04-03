import { type MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireUserId } from '../services/auth/session.server'
import { AppTransaction } from '../utils/transform-data'
import RecurringBills from '../components/RecurringBills'
import { getFinancialData } from '../services/finance/finance.service'
import { Transaction } from '../types/finance.types'

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
  const getDateString = (dateValue: string | Date): string => {
    try {
      if (dateValue instanceof Date) {
        return dateValue.toISOString().split('T')[0]
      }
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
    isPaid: transaction.isPaid,
    isOverdue: transaction.isOverdue,
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Require user ID for authorization
  await requireUserId(request)

  // Get financial data from the service which will fall back to JSON file if DB fails
  const financialData = await getFinancialData()

  // Debug: Log bills data
  console.log(
    'Bills Data:',
    financialData.bills.map((bill) => ({
      name: bill.name,
      isPaid: bill.isPaid,
      isOverdue: bill.isOverdue,
    }))
  )

  // Transform bills to AppTransaction format
  const billsTransactions = financialData.bills.map((bill) => ({
    id: bill.id.toString(),
    date: bill.date instanceof Date ? bill.date.toISOString() : bill.date,
    description: bill.name,
    amount: bill.amount,
    type: bill.amount > 0 ? 'income' : 'expense',
    category: bill.category,
    avatar: bill.avatar,
    dueDay: bill.dueDay,
    isPaid: bill.isPaid,
    isOverdue: bill.isOverdue,
  }))

  // Calculate total of recurring bills (only negative amounts)
  const recurringBills = billsTransactions.filter((tx) => tx.amount < 0)
  const totalBills = recurringBills.reduce(
    (total, tx) => total + Math.abs(tx.amount),
    0
  )

  // Get today's date
  const today = new Date()

  // Filter bills based on their isPaid status
  const paidBillsList = recurringBills.filter((bill) => bill.isPaid === true)
  const upcomingBillsList = recurringBills.filter(
    (bill) => bill.isPaid === false
  )

  // Bills due within the next 5 days are considered "due soon"
  const fiveDaysFromNow = new Date(today)
  fiveDaysFromNow.setDate(today.getDate() + 5)
  const dueSoonBillsList = upcomingBillsList.filter(
    (bill) => !bill.isOverdue && new Date(bill.date) <= fiveDaysFromNow
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
    transactions: recurringBills,
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
