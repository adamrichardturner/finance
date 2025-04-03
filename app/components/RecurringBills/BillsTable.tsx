import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { AppTransaction } from '~/utils/transform-data'
import { renderAvatar } from '~/utils/avatar-utils'

interface BillsTableProps {
  bills: AppTransaction[]
}

const BillsTable: React.FC<BillsTableProps> = ({ bills }) => {
  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toFixed(2)}`
  }

  const isOverdue = (date: string) => {
    return new Date(date) < new Date()
  }

  const isUpcoming = (date: string) => {
    const dueDate = new Date(date)
    const now = new Date()
    const fiveDaysFromNow = new Date()
    fiveDaysFromNow.setDate(now.getDate() + 5)

    return dueDate > now && dueDate <= fiveDaysFromNow
  }

  const getStatusColor = (date: string) => {
    if (isOverdue(date)) {
      return 'bg-red-100 text-red-700'
    }

    if (isUpcoming(date)) {
      return 'bg-amber-100 text-amber-700'
    }

    return 'bg-blue-100 text-blue-700'
  }

  const getStatusText = (date: string) => {
    if (isOverdue(date)) {
      return 'Overdue'
    }

    if (isUpcoming(date)) {
      return 'Due soon'
    }

    return 'Upcoming'
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full'>
        <thead>
          <tr className='border-b'>
            <th className='text-left pb-4 font-medium text-gray-500'>Bill</th>
            <th className='text-left pb-4 font-medium text-gray-500'>
              Due Date
            </th>
            <th className='text-right pb-4 font-medium text-gray-500'>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {bills.length > 0 ? (
            bills.map((bill) => (
              <tr key={bill.id} className='border-b hover:bg-gray-50'>
                <td className='py-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0'>
                      {renderAvatar(bill.description, bill.avatar)}
                    </div>
                    <div>
                      <p className='font-medium'>{bill.description}</p>
                      <p className='text-sm text-gray-500'>{bill.category}</p>
                    </div>
                  </div>
                </td>
                <td className='py-4'>
                  <div className='flex flex-col'>
                    <div
                      className={`text-xs px-2 py-1 rounded-full w-fit ${getStatusColor(bill.date)}`}
                    >
                      {getStatusText(bill.date)}
                    </div>
                    <p className='text-sm text-gray-500 mt-1'>
                      {formatDistanceToNow(new Date(bill.date), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </td>
                <td className='py-4 text-right font-medium text-gray-900'>
                  {formatCurrency(bill.amount)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className='py-6 text-center text-gray-500'>
                No bills found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default BillsTable
