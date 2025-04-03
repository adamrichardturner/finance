import React from 'react'
import { format, isAfter, subMonths } from 'date-fns'
import { AppTransaction } from '~/utils/transform-data'
import { renderAvatar } from '~/utils/avatar-utils'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

interface BillsTableProps {
  bills: AppTransaction[]
}

const BillsTable: React.FC<BillsTableProps> = ({ bills }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount))
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

  // Check if date is over a month old
  const isOverAMonthOld = (dateString: string): boolean => {
    const date = new Date(dateString)
    const oneMonthAgo = subMonths(new Date(), 1)
    return date < oneMonthAgo
  }

  // Format the due day with the appropriate suffix (1st, 2nd, 3rd, etc.)
  const formatDueDay = (day: number): string => {
    if (day >= 11 && day <= 13) {
      return `${day}th`
    }

    switch (day % 10) {
      case 1:
        return `${day}st`
      case 2:
        return `${day}nd`
      case 3:
        return `${day}rd`
      default:
        return `${day}th`
    }
  }

  // Get due day from transaction, either from dueDay field or from date
  const getDueDay = (bill: AppTransaction): number => {
    if (bill.dueDay) return bill.dueDay
    return new Date(bill.date).getDate()
  }

  // For demo purposes, consider bills with dates in the past as paid unless explicitly marked as unpaid
  const isPaid = (bill: AppTransaction): boolean => {
    // If isPaid is explicitly defined, always respect that value
    if (bill.isPaid !== undefined) {
      return bill.isPaid
    }

    // Otherwise fall back to date-based logic
    return (
      isOverAMonthOld(bill.date) ||
      (isOverdue(bill.date) && Math.random() > 0.3)
    )
  }

  // Check if a bill is overdue
  const checkOverdue = (bill: AppTransaction): boolean => {
    // If explicitly marked as overdue, respect that value
    if (bill.isOverdue !== undefined) {
      return bill.isOverdue
    }

    // If it's paid, it can't be overdue
    if (isPaid(bill)) {
      return false
    }

    // Otherwise, check date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const billDate = new Date(bill.date)
    return billDate < today
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full'>
        <thead className='max-[640px]:hidden'>
          <tr className='border-b'>
            <th className='text-left pb-4 font-[400] text-gray-500 text-[12px]'>
              Bill Title
            </th>
            <th className='text-left pb-4 font-[400] text-gray-500 text-[12px]'>
              Due Date
            </th>
            <th className='text-right pb-4 font-[400] text-gray-500 text-[12px]'>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {bills.length > 0 ? (
            bills.map((bill) => {
              const paid = isPaid(bill)
              const overdue = checkOverdue(bill)

              // Debug overdue calculation
              console.log(
                `Bill ${bill.description}: isPaid=${paid}, isOverdue property=${bill.isOverdue}, calculated overdue=${overdue}`
              )

              return (
                <tr
                  key={bill.id}
                  className={`border-b hover:bg-gray-50 min-h-[56px] ${
                    overdue ? 'border-l-2 border-l-[#C94736]' : ''
                  }`}
                >
                  <td className='py-4 max-[640px]:py-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0'>
                        {renderAvatar(bill.description, bill.avatar)}
                      </div>
                      <div className='flex-1'>
                        <p className='font-medium'>{bill.description}</p>
                        {/* Show due date under description on small screens */}
                        <div className='sm:hidden flex items-center mt-1'>
                          {isOverAMonthOld(bill.date) ? (
                            <p
                              className={`text-[12px] ${overdue ? 'text-[#C94736]' : 'text-gray-600'}`}
                            >
                              {format(new Date(bill.date), 'dd/MM/yyyy')}
                            </p>
                          ) : (
                            <p
                              className={`text-[12px] ${overdue ? 'text-[#C94736]' : 'text-gray-600'}`}
                            >
                              Monthly-{formatDueDay(getDueDay(bill))}
                            </p>
                          )}

                          {paid ? (
                            <CheckCircle2 className='h-4 w-4 text-green-500 ml-2' />
                          ) : overdue ? (
                            <AlertTriangle className='h-4 w-4 text-[#C94736] ml-2' />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='py-4 max-[640px]:py-3 sm:table-cell hidden'>
                    <div className='flex items-center'>
                      {isOverAMonthOld(bill.date) ? (
                        <p
                          className={`text-[12px] ${overdue ? 'text-[#C94736]' : 'text-gray-600'}`}
                        >
                          {format(new Date(bill.date), 'dd/MM/yyyy')}
                        </p>
                      ) : (
                        <p
                          className={`text-[12px] ${overdue ? 'text-[#C94736]' : 'text-gray-600'}`}
                        >
                          Monthly-{formatDueDay(getDueDay(bill))}
                        </p>
                      )}

                      {paid ? (
                        <CheckCircle2 className='h-4 w-4 text-green-500 ml-2' />
                      ) : overdue ? (
                        <AlertTriangle className='h-4 w-4 text-[#C94736] ml-2' />
                      ) : null}
                    </div>
                  </td>
                  <td className='py-4 max-[640px]:py-3 text-right font-medium max-[640px]:text-[#C94736] max-[640px]:font-bold'>
                    {bill.amount < 0 ? (
                      <span
                        className={
                          overdue
                            ? 'text-[#C94736] font-medium'
                            : 'text-gray-900'
                        }
                      >
                        {formatCurrency(bill.amount)}
                      </span>
                    ) : (
                      <span className='text-green-600'>
                        {formatCurrency(bill.amount)}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })
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
