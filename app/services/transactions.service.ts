import { Transaction } from '~/types/finance.types'
import { AppTransaction } from '~/utils/transform-data'

// Sample transactions for demo
const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    avatar: '/assets/icons/tax.svg',
    name: 'Tax Refund',
    category: 'Income',
    date: new Date(2023, 8, 7),
    amount: 450,
    recurring: false,
  },
  {
    id: 2,
    avatar: '/assets/icons/transfer.svg',
    name: 'Transfer to Savings',
    category: 'Transfers',
    date: new Date(2023, 8, 6),
    amount: -300,
    recurring: false,
  },
  {
    id: 3,
    avatar: '/assets/icons/car.svg',
    name: 'Car Insurance',
    category: 'Insurance',
    date: new Date(2023, 8, 5),
    amount: -95,
    recurring: true,
  },
  {
    id: 4,
    avatar: '/assets/icons/coffee.svg',
    name: 'Coffee Shop',
    category: 'Dining Out',
    date: new Date(2023, 8, 4),
    amount: -8,
    recurring: false,
  },
  {
    id: 5,
    avatar: '/assets/icons/restaurant.svg',
    name: 'Lunch',
    category: 'Dining Out',
    date: new Date(2023, 8, 3),
    amount: -20,
    recurring: false,
  },
  {
    id: 6,
    avatar: '/assets/icons/gift.svg',
    name: 'Gift Received',
    category: 'Income',
    date: new Date(2023, 8, 2),
    amount: 250,
    recurring: false,
  },
  {
    id: 7,
    avatar: '/assets/icons/gym.svg',
    name: 'Gym Membership',
    category: 'Personal Care',
    date: new Date(2023, 8, 1),
    amount: -60,
    recurring: true,
  },
  {
    id: 8,
    avatar: '/assets/icons/phone.svg',
    name: 'Phone Bill',
    category: 'Utilities',
    date: new Date(2023, 7, 30),
    amount: -50,
    recurring: true,
  },
  {
    id: 9,
    avatar: '/assets/icons/streaming.svg',
    name: 'Streaming Service',
    category: 'Entertainment',
    date: new Date(2023, 7, 29),
    amount: -15,
    recurring: true,
  },
  {
    id: 10,
    avatar: '/assets/icons/shopping.svg',
    name: 'Online Shopping',
    category: 'Shopping',
    date: new Date(2023, 7, 28),
    amount: -95,
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

export async function getTransactions(): Promise<AppTransaction[]> {
  try {
    // In a real app, this would be an API call
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return SAMPLE_TRANSACTIONS.map(transformToAppTransaction)
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    throw new Error('Failed to fetch transactions')
  }
}
