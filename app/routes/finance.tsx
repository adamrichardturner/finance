import { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getUser, requireUserId } from '~/services/auth/session.server'
import demoData from '../lib/data.json'
import { useState } from 'react'
import { AppLayout } from '~/components/layouts/AppLayout'

// Define the Transaction type to include all properties
type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  type: string
  category?: string
  recurring?: boolean
  avatar?: string
}

// Transform transaction from data.json format to our app format
function transformTransaction(tx: any, index: number): Transaction {
  return {
    id: `tx-${index}`,
    date: new Date(tx.date).toISOString().slice(0, 10),
    description: tx.name,
    amount: tx.amount,
    type: tx.amount > 0 ? 'income' : 'expense',
    category: tx.category,
    recurring: tx.recurring,
    avatar: tx.avatar
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(tx.name)}&background=random`
      : undefined,
  }
}

// Define types for our financial data
type FinancialData = {
  balance: number
  income: number
  expenses: number
  transactions: Transaction[]
  budgets?: any[]
  pots?: any[]
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure the user is authenticated to access this route
  await requireUserId(request)

  const user = await getUser(request)
  const isDemoUser = user?.id === 'demo-user-id'

  let financialData: FinancialData

  if (isDemoUser) {
    // Use the data from data.json for demo users
    const balance = demoData.balance.current
    const income = demoData.balance.income
    const expenses = demoData.balance.expenses

    // Transform transactions to our application format
    const transactions = demoData.transactions
      .slice(0, 10)
      .map(transformTransaction)

    financialData = {
      balance,
      income,
      expenses,
      transactions,
      budgets: demoData.budgets,
      pots: demoData.pots,
    }
  } else {
    // In a real app, you would fetch financial data from the database here
    financialData = {
      balance: 4836.92,
      income: 3814.25,
      expenses: 1700.5,
      transactions: [
        {
          id: 'tx1',
          date: new Date().toISOString().slice(0, 10),
          description: 'Salary deposit',
          amount: 3500.0,
          type: 'income',
        },
        {
          id: 'tx2',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
          description: 'Freelance work',
          amount: 314.25,
          type: 'income',
        },
        {
          id: 'tx3',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
          description: 'Rent payment',
          amount: -1200.0,
          type: 'expense',
        },
        {
          id: 'tx4',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
          description: 'Grocery shopping',
          amount: -127.83,
          type: 'expense',
        },
        {
          id: 'tx5',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
          description: 'Internet bill',
          amount: -65.99,
          type: 'expense',
        },
      ],
    }
  }

  return { financialData, isDemoUser }
}

export default function FinancePage() {
  const { financialData, isDemoUser } = useLoaderData<typeof loader>()
  const [activeTab, setActiveTab] = useState('transactions')

  // Log to confirm the component is rendering
  console.log('Rendering Finance page with AppLayout')

  return (
    <AppLayout>
      <div className='bg-white shadow dark:bg-gray-800'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
            Finances
          </h1>
        </div>
      </div>

      <div className='mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8'>
        {/* Financial overview */}
        <div className='mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3'>
          <div className='rounded-lg bg-white p-6 shadow dark:bg-gray-800'>
            <h2 className='text-lg font-medium text-gray-900 dark:text-white'>
              Balance
            </h2>
            <p className='mt-2 text-3xl font-bold text-gray-900 dark:text-white'>
              ${financialData.balance.toFixed(2)}
            </p>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Current account balance
            </p>
          </div>

          <div className='rounded-lg bg-white p-6 shadow dark:bg-gray-800'>
            <h2 className='text-lg font-medium text-gray-900 dark:text-white'>
              Income
            </h2>
            <p className='mt-2 text-3xl font-bold text-green-600 dark:text-green-400'>
              ${financialData.income.toFixed(2)}
            </p>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Total monthly income
            </p>
          </div>

          <div className='rounded-lg bg-white p-6 shadow dark:bg-gray-800'>
            <h2 className='text-lg font-medium text-gray-900 dark:text-white'>
              Expenses
            </h2>
            <p className='mt-2 text-3xl font-bold text-red-600 dark:text-red-400'>
              ${financialData.expenses.toFixed(2)}
            </p>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Total monthly expenses
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className='mb-4 border-b border-gray-200 dark:border-gray-700'>
          <ul className='flex flex-wrap -mb-px text-sm font-medium text-center'>
            <li className='mr-2'>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'transactions'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                    : 'border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                Transactions
              </button>
            </li>

            {isDemoUser && financialData.budgets && (
              <li className='mr-2'>
                <button
                  onClick={() => setActiveTab('budgets')}
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${
                    activeTab === 'budgets'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                      : 'border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  Budgets
                </button>
              </li>
            )}

            {isDemoUser && financialData.pots && (
              <li className='mr-2'>
                <button
                  onClick={() => setActiveTab('savings')}
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${
                    activeTab === 'savings'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                      : 'border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  Savings
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className='rounded-lg bg-white shadow dark:bg-gray-800'>
            <div className='px-4 py-5 sm:px-6'>
              <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-white'>
                Recent Transactions
              </h3>
            </div>
            <div className='border-t border-gray-200 dark:border-gray-700'>
              <ul className='divide-y divide-gray-200 dark:divide-gray-700'>
                {financialData.transactions.map((transaction) => (
                  <li key={transaction.id} className='px-4 py-4 sm:px-6'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        {transaction.avatar && isDemoUser && (
                          <div className='mr-4 h-10 w-10 flex-shrink-0'>
                            <img
                              className='h-10 w-10 rounded-full'
                              src={transaction.avatar}
                              alt=''
                            />
                          </div>
                        )}
                        <div>
                          <p className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                            {transaction.description}
                          </p>
                          <div className='flex space-x-2'>
                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                              {transaction.date}
                            </p>
                            {transaction.category && (
                              <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'>
                                {transaction.category}
                              </span>
                            )}
                            {transaction.recurring && (
                              <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'>
                                Recurring
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          transaction.amount > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : '-'}
                        {Math.abs(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && isDemoUser && financialData.budgets && (
          <div className='rounded-lg bg-white shadow dark:bg-gray-800'>
            <div className='px-4 py-5 sm:px-6'>
              <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-white'>
                Monthly Budgets
              </h3>
            </div>
            <div className='border-t border-gray-200 dark:border-gray-700 p-4'>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                {financialData.budgets.map((budget, index) => {
                  // Calculate a random spent amount for demo purposes
                  const spent =
                    Math.round(Math.random() * budget.maximum * 100) / 100
                  const percentage = Math.min(
                    100,
                    Math.round((spent / budget.maximum) * 100)
                  )

                  return (
                    <div
                      key={index}
                      className='bg-white rounded-lg shadow p-4 dark:bg-gray-800'
                    >
                      <div className='flex justify-between items-center mb-2'>
                        <h4 className='font-medium text-gray-900 dark:text-white'>
                          {budget.category}
                        </h4>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>
                          ${spent.toFixed(2)} / ${budget.maximum.toFixed(2)}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
                        <div
                          className='h-2.5 rounded-full'
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: budget.theme,
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Savings Tab */}
        {activeTab === 'savings' && isDemoUser && financialData.pots && (
          <div className='rounded-lg bg-white shadow dark:bg-gray-800'>
            <div className='px-4 py-5 sm:px-6'>
              <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-white'>
                Savings Goals
              </h3>
            </div>
            <div className='border-t border-gray-200 dark:border-gray-700 p-4'>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {financialData.pots.map((pot, index) => {
                  const percentage = Math.round((pot.total / pot.target) * 100)

                  return (
                    <div
                      key={index}
                      className='bg-white rounded-lg shadow p-4 dark:bg-gray-800'
                    >
                      <div className='flex justify-between items-center mb-2'>
                        <h4 className='font-medium text-gray-900 dark:text-white'>
                          {pot.name}
                        </h4>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>
                          ${pot.total.toFixed(2)} / ${pot.target.toFixed(2)}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700'>
                        <div
                          className='h-2.5 rounded-full'
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: pot.theme,
                          }}
                        ></div>
                      </div>
                      <div className='text-right text-sm text-gray-500 dark:text-gray-400'>
                        {percentage}% funded
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
