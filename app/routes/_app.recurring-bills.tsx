import { type MetaFunction, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireUserId } from '../services/auth/session.server'
import RecurringBills from '../components/RecurringBills'
import { getFinancialData } from '../services/finance/finance.service'

export const meta: MetaFunction = () => {
  return [
    { title: 'Recurring Bills | Finance App' },
    { name: 'description', content: 'Manage your Recurring Bills' },
  ]
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
