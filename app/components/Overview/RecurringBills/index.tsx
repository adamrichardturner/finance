import { Card, CardTitle, CardHeader } from '~/components/ui/card'
import { AppTransaction } from '~/utils/transform-data'
import { useNavigate } from '@remix-run/react'
import { useMemo } from 'react'

interface RecurringBillsProps {
  bills: AppTransaction[]
  title?: string
}

const RecurringBills: React.FC<RecurringBillsProps> = ({
  bills,
  title = 'Recurring Bills',
}) => {
  const navigate = useNavigate()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount))
  }

  const isOverdue = (bill: AppTransaction): boolean => {
    if (bill.isOverdue !== undefined) {
      return bill.isOverdue
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(bill.date) < today
  }

  const isPaid = (bill: AppTransaction): boolean => {
    if (bill.isPaid !== undefined) {
      return bill.isPaid
    }
    return false
  }

  const summaryData = useMemo(() => {
    if (!bills || bills.length === 0) {
      return {
        paidBills: { count: 0, amount: 0 },
        totalUpcoming: { count: 0, amount: 0 },
        dueSoon: { count: 0, amount: 0 },
      }
    }

    const paidBillsList = bills.filter((bill) => isPaid(bill))

    const upcomingBillsList = bills.filter((bill) => !isPaid(bill))

    const today = new Date()
    const fiveDaysFromNow = new Date(today)
    fiveDaysFromNow.setDate(today.getDate() + 5)

    const dueSoonBillsList = upcomingBillsList.filter(
      (bill) => !isOverdue(bill) && new Date(bill.date) <= fiveDaysFromNow
    )

    const paidBillsAmount = paidBillsList.reduce(
      (total, bill) => total + Math.abs(bill.amount),
      0
    )

    const upcomingBillsAmount = upcomingBillsList.reduce(
      (total, bill) => total + Math.abs(bill.amount),
      0
    )

    const dueSoonAmount = dueSoonBillsList.reduce(
      (total, bill) => total + Math.abs(bill.amount),
      0
    )

    return {
      paidBills: {
        count: paidBillsList.length,
        amount: paidBillsAmount,
      },
      totalUpcoming: {
        count: upcomingBillsList.length,
        amount: upcomingBillsAmount,
      },
      dueSoon: {
        count: dueSoonBillsList.length,
        amount: dueSoonAmount,
      },
    }
  }, [bills])

  if (!bills || bills.length === 0) {
    return null
  }

  return (
    <Card className='p-[32px] flex flex-col gap-4 shadow-none flex-grow flex-1 h-full'>
      <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
        <CardTitle className='text-[20px]'>{title}</CardTitle>
        <div
          className='text-[14px] text-gray-500 cursor-pointer hover:text-black transition-colors flex flex-row gap-1'
          onClick={() => navigate('/recurring-bills')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/recurring-bills')
            }
          }}
          tabIndex={0}
          role='button'
        >
          See Details
          <span className='flex items-center'>
            <img
              src='/assets/icons/Pointer.svg'
              alt='Pointer Icon'
              className={`h-2 w-2 ml-2`}
            />
          </span>
        </div>
      </CardHeader>
      <div className='grid grid-cols-1 gap-4 mt-2'>
        <div className='flex items-center justify-between p-4 rounded-lg bg-[#F8F4F0] border-l-4 border-blue-400 transition-colors duration-200 hover:bg-[#f9f9f9]'>
          <div className='flex flex-col'>
            <span className='font-[400] text-[16px] text-gray-900'>
              Paid Bills
            </span>
          </div>
          <span className='font-bold text-[16px] text-gray-900'>
            {formatCurrency(summaryData.paidBills.amount)}
          </span>
        </div>

        <div className='flex items-center justify-between p-4 rounded-lg bg-[#F8F4F0] border-l-4 border-orange-400 transition-colors duration-200 hover:bg-[#f9f9f9]'>
          <div className='flex flex-col'>
            <span className='font-[400] text-[16px] text-gray-900'>
              Total Upcoming
            </span>
          </div>
          <span className='font-bold text-[16px] text-gray-900'>
            {formatCurrency(summaryData.totalUpcoming.amount)}
          </span>
        </div>

        <div className='flex items-center justify-between p-4 rounded-lg bg-[#F8F4F0] border-l-4 border-green-400 transition-colors duration-200 hover:bg-[#f9f9f9]'>
          <div className='flex flex-col'>
            <span className='font-[400] text-[16px] text-gray-900'>
              Due Soon
            </span>
          </div>
          <span className='font-bold text-[16px] text-gray-900'>
            {formatCurrency(summaryData.dueSoon.amount)}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default RecurringBills
