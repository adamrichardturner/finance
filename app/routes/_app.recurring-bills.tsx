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
    { name: 'description', content: 'Manage your Recurring Bills' },
  ]
}

function transformToAppTransaction(transaction: Transaction): AppTransaction {
  const processAvatarPath = (path?: string): string | undefined => {
    if (!path) {
      return transaction.amount > 0
        ? '/assets/icons/salary.svg'
        : '/assets/icons/expense.svg'
    }

    if (path.startsWith('./')) {
      return path.substring(2)
    }

    return path
  }

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
  await requireUserId(request)

  const financialData = await getFinancialData()

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

  const recurringBills = billsTransactions.filter((tx) => tx.amount < 0)
  const totalBills = recurringBills.reduce(
    (total, tx) => total + Math.abs(tx.amount),
    0
  )

  const today = new Date()

  const paidBillsList = recurringBills.filter((bill) => bill.isPaid === true)
  const upcomingBillsList = recurringBills.filter(
    (bill) => bill.isPaid === false
  )

  const fiveDaysFromNow = new Date(today)
  fiveDaysFromNow.setDate(today.getDate() + 5)
  const dueSoonBillsList = upcomingBillsList.filter(
    (bill) => !bill.isOverdue && new Date(bill.date) <= fiveDaysFromNow
  )

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
