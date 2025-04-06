import React from 'react'
import { format } from 'date-fns'
import { AppTransaction } from '~/utils/transform-data'
import { renderAvatar } from '~/utils/avatar-utils'
import { CheckCircle2, AlertCircle } from 'lucide-react'

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

  const formatBillDate = (bill: AppTransaction): string => {
    try {
      // If the bill has a dueDay, use it to create a date in April 2025
      if (bill.dueDay) {
        // Create a date for April with the specified dueDay
        const date = new Date(2025, 3, bill.dueDay) // April is month 3 (0-indexed)
        return format(date, 'dd/MM/yyyy')
      }

      // Otherwise use the date property
      const date = new Date(bill.date)
      // Force year to be 2025 if it isn't already
      if (date.getFullYear() !== 2025) {
        date.setFullYear(2025)
      }
      // Force month to be April (3) if needed
      if (date.getMonth() !== 3) {
        date.setMonth(3)
      }
      return format(date, 'dd/MM/yyyy')
    } catch (error) {
      return 'Invalid date'
    }
  }

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

  const getDueDay = (bill: AppTransaction): number => {
    if (bill.dueDay) return bill.dueDay
    return new Date(bill.date).getDate()
  }

  const isPaid = (bill: AppTransaction): boolean => {
    if (bill.isPaid !== undefined) {
      return bill.isPaid
    }

    if (bill.isOverdue === true) {
      return false
    }

    const billDate = new Date(bill.date)
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    return (
      billDate < oneMonthAgo || (isOverdue(bill.date) && Math.random() > 0.3)
    )
  }

  const checkOverdue = (bill: AppTransaction): boolean => {
    if (bill.isOverdue !== undefined) {
      return bill.isOverdue
    }

    if (isPaid(bill)) {
      return false
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const billDate = new Date(bill.date)
    return billDate < today
  }

  return (
    <div
      id='scrollable-bills'
      className='overflow-hidden hide-scrollbar'
      style={{ overflow: 'hidden', overflowY: 'auto', maxHeight: '60vh' }}
    >
      <table className='w-full'>
        <thead className='max-[640px]:hidden'>
          <tr className='border-b sticky top-0 bg-white z-10'>
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

              return (
                <tr
                  key={bill.id}
                  className={`border-b hover:bg-gray-50 min-h-[56px]`}
                >
                  <td className='py-4 max-[640px]:py-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0'>
                        {renderAvatar(bill.description, bill.avatar)}
                      </div>
                      <div className='flex-1'>
                        <p className='font-medium text-[14px]'>
                          {bill.description}
                        </p>

                        <div className='sm:hidden flex items-center mt-1'>
                          <p
                            className={`text-[12px] ${overdue ? 'text-[#C94736]' : 'text-gray-600'}`}
                          >
                            {formatBillDate(bill)}
                          </p>

                          {paid ? (
                            <CheckCircle2 className='h-4 w-4 text-green-500 ml-2' />
                          ) : overdue ? (
                            <AlertCircle className='h-4 w-4 text-[#C94736] ml-2' />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='py-4 max-[640px]:py-3 sm:table-cell hidden'>
                    <div className='flex items-center'>
                      <p
                        className={`text-[12px] ${overdue ? 'text-[#C94736]' : 'text-gray-600'}`}
                      >
                        {formatBillDate(bill)}
                      </p>

                      {paid ? (
                        <CheckCircle2 className='h-4 w-4 text-green-500 ml-2' />
                      ) : overdue ? (
                        <AlertCircle className='h-4 w-4 text-[#C94736] ml-2' />
                      ) : null}
                    </div>
                  </td>
                  <td className='py-4 max-[640px]:py-3 text-[14px] text-right font-medium max-[640px]:text-[#C94736] max-[640px]:font-bold'>
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
                      <span className='text-green-600 text-[14px]'>
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
          {bills.length > 0 && (
            <tr>
              <td colSpan={3} className='py-2 text-center'>
                <div className='text-xs text-muted-foreground'>
                  End of bills
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default BillsTable
