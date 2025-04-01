import { type MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import Overview from '~/components/Overview'
import { Budget, Pot, Transaction } from '~/types/finance.types'
import { AppTransaction } from '~/utils/transform-data'

export const meta: MetaFunction = () => {
  return [
    { title: 'Finance Overview' },
    { name: 'description', content: 'View your financial overview' },
  ]
}

// Sample data for demonstration
const SAMPLE_POTS: Pot[] = [
  {
    id: 1,
    name: 'Holiday',
    total: 1200,
    target: 2000,
    theme: '#47B4AC',
  },
  {
    id: 2,
    name: 'Emergency',
    total: 5000,
    target: 10000,
    theme: '#F58A51',
  },
  {
    id: 3,
    name: 'New Car',
    total: 3500,
    target: 5000,
    theme: '#5E76BF',
  },
  {
    id: 4,
    name: 'House Deposit',
    total: 10000,
    target: 20000,
    theme: '#D988B9',
  },
]

const SAMPLE_BUDGETS: Budget[] = [
  {
    id: 1,
    category: 'Housing',
    maximum: '1200',
    theme: '#47B4AC',
    transactions: [],
    user_id: '1',
  },
  {
    id: 2,
    category: 'Food',
    maximum: '500',
    theme: '#F58A51',
    transactions: [],
    user_id: '1',
  },
  {
    id: 3,
    category: 'Transport',
    maximum: '350',
    theme: '#5E76BF',
    transactions: [],
    user_id: '1',
  },
  {
    id: 4,
    category: 'Entertainment',
    maximum: '250',
    theme: '#D988B9',
    transactions: [],
    user_id: '1',
  },
  {
    id: 5,
    category: 'Utilities',
    maximum: '300',
    theme: '#43A047',
    transactions: [],
    user_id: '1',
  },
]

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    avatar: '/assets/icons/bank.svg',
    name: 'Mortgage Payment',
    category: 'Housing',
    date: new Date(2023, 7, 1),
    amount: -1200,
    recurring: true,
  },
  {
    id: 2,
    avatar: '/assets/icons/utility.svg',
    name: 'Electricity Bill',
    category: 'Utilities',
    date: new Date(2023, 7, 5),
    amount: -85,
    recurring: true,
  },
  {
    id: 3,
    avatar: '/assets/icons/wifi.svg',
    name: 'Internet Provider',
    category: 'Utilities',
    date: new Date(2023, 7, 7),
    amount: -45,
    recurring: true,
  },
  {
    id: 4,
    avatar: '/assets/icons/shopping.svg',
    name: 'Grocery Store',
    category: 'Food',
    date: new Date(2023, 7, 10),
    amount: -120,
    recurring: false,
  },
  {
    id: 5,
    avatar: '/assets/icons/salary.svg',
    name: 'Salary',
    category: 'Income',
    date: new Date(2023, 7, 15),
    amount: 3500,
    recurring: true,
  },
  {
    id: 6,
    avatar: '/assets/icons/restaurant.svg',
    name: 'Restaurant',
    category: 'Entertainment',
    date: new Date(2023, 7, 18),
    amount: -75,
    recurring: false,
  },
]

// Transform Transaction to AppTransaction
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
    avatar: transaction.avatar,
  }
}

export const loader = async () => {
  // Transform transactions to AppTransaction format
  const appTransactions = SAMPLE_TRANSACTIONS.map(transformToAppTransaction)

  // In a real app, you would fetch this data from your database
  return {
    balance: 12500,
    income: 4500,
    expenses: 2300,
    pots: SAMPLE_POTS,
    budgets: SAMPLE_BUDGETS,
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
