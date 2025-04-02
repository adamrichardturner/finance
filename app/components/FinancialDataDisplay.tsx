import React from 'react'
import { FinancialData } from '~/types/finance.types'

interface FinancialDataDisplayProps {
  data: FinancialData
}

export function FinancialDataDisplay({ data }: FinancialDataDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className='space-y-8'>
      <section className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
        <h2 className='mb-4 text-xl font-semibold'>Account Balance</h2>
        <div className='grid grid-cols-3 gap-4'>
          <div className='rounded-md bg-green-100 p-4 dark:bg-green-900'>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              Current Balance
            </p>
            <p className='text-2xl font-bold text-green-700 dark:text-green-300'>
              {formatCurrency(data.balance.current)}
            </p>
          </div>
          <div className='rounded-md bg-blue-100 p-4 dark:bg-blue-900'>
            <p className='text-sm text-gray-600 dark:text-gray-300'>Income</p>
            <p className='text-2xl font-bold text-blue-700 dark:text-blue-300'>
              {formatCurrency(data.balance.income)}
            </p>
          </div>
          <div className='rounded-md bg-red-100 p-4 dark:bg-red-900'>
            <p className='text-sm text-gray-600 dark:text-gray-300'>Expenses</p>
            <p className='text-2xl font-bold text-red-700 dark:text-red-300'>
              {formatCurrency(data.balance.expenses)}
            </p>
          </div>
        </div>
      </section>

      <section className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
        <h2 className='mb-4 text-xl font-semibold'>Transactions</h2>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-50 dark:bg-gray-700'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300'>
                  Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300'>
                  Category
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300'>
                  Date
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300'>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800'>
              {data.transactions.slice(0, 10).map((transaction, index) => (
                <tr key={index}>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='flex items-center'>
                      <div className='h-10 w-10 flex-shrink-0 overflow-hidden rounded-full'>
                        <img src={transaction.avatar} alt={transaction.name} />
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                          {transaction.name}
                        </div>
                        {transaction.recurring && (
                          <div className='text-xs text-gray-500 dark:text-gray-400'>
                            Recurring
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
                    {transaction.category}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
                    {formatDate(transaction.date)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-6 py-4 text-right text-sm ${
                      transaction.amount < 0
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {transaction.amount >= 0 ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.transactions.length > 10 && (
          <div className='mt-4 text-center'>
            <span className='text-sm text-gray-500 dark:text-gray-400'>
              Showing 10 of {data.transactions.length} transactions
            </span>
          </div>
        )}
      </section>

      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        <section className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
          <h2 className='mb-4 text-xl font-semibold'>Budgets</h2>
          <div className='space-y-4'>
            {data.budgets.map((budget, index) => (
              <div
                key={index}
                className='rounded-lg border p-4 dark:border-gray-700'
              >
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>{budget.category}</span>
                  <span className='text-sm font-semibold'>
                    {formatCurrency(budget.maximum)}
                  </span>
                </div>
                <div
                  className='mt-2 h-2 rounded-full'
                  style={{ backgroundColor: budget.theme }}
                ></div>
              </div>
            ))}
          </div>
        </section>

        <section className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
          <h2 className='mb-4 text-xl font-semibold'>Savings Pots</h2>
          <div className='space-y-4'>
            {data.pots.map((pot, index) => (
              <div
                key={index}
                className='rounded-lg border p-4 dark:border-gray-700'
              >
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>{pot.name}</span>
                  <span className='text-sm font-semibold'>
                    {formatCurrency(pot.total)} / {formatCurrency(pot.target)}
                  </span>
                </div>
                <div className='mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                  <div
                    className='h-full rounded-full'
                    style={{
                      width: `${Math.min(
                        100,
                        (pot.total / pot.target) * 100
                      )}%`,
                      backgroundColor: pot.theme,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
