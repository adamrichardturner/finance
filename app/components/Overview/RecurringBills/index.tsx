import { Card, CardTitle, CardHeader } from '~/components/ui/card'
import Pointer from '../../../../public/assets/icons/Pointer.svg'
import { AppTransaction } from '~/utils/transform-data'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
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

  if (!bills || bills.length === 0) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount))
  }

  // Check if a bill is overdue
  const isOverdue = (bill: AppTransaction): boolean => {
    // Use the explicit isOverdue property if available
    if (bill.isOverdue !== undefined) {
      return bill.isOverdue
    }

    // Otherwise use the date to determine if it's overdue
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to start of day for fair comparison
    return new Date(bill.date) < today
  }

  // Check if a bill is paid
  const isPaid = (bill: AppTransaction): boolean => {
    if (bill.isPaid !== undefined) {
      return bill.isPaid
    }
    return false
  }

  // Calculate summary data from actual bills data
  const summaryData = useMemo(() => {
    // Filter bills that are paid
    const paidBillsList = bills.filter((bill) => isPaid(bill))

    // Filter bills that are not paid
    const upcomingBillsList = bills.filter((bill) => !isPaid(bill))

    // Bills due within the next 5 days are considered "due soon"
    const today = new Date()
    const fiveDaysFromNow = new Date(today)
    fiveDaysFromNow.setDate(today.getDate() + 5)

    const dueSoonBillsList = upcomingBillsList.filter(
      (bill) => !isOverdue(bill) && new Date(bill.date) <= fiveDaysFromNow
    )

    // Calculate total amounts
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

  // Format the due day with the appropriate suffix
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

  // Get due day from transaction
  const getDueDay = (bill: AppTransaction): number => {
    if (bill.dueDay) return bill.dueDay
    return new Date(bill.date).getDate()
  }

  return (
    <Card className='p-[32px] flex flex-col gap-4 shadow-none flex-grow flex-1 h-full'>
      <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
        <CardTitle className='text-[20px]'>{title}</CardTitle>
        <div
          className='text-[14px] text-gray-500 cursor-pointer hover:text-black transition-colors flex flex-row gap-1'
          onClick={() => navigate('/recurring-bills')}
        >
          See Details
          <span className='flex items-center'>
            <img src={Pointer} alt='Pointer Icon' className={`h-2 w-2 ml-2`} />
          </span>
        </div>
      </CardHeader>
      <div className='grid grid-cols-1 gap-4 mt-2'>
        {/* Paid Bills */}
        <div className='flex items-center justify-between p-4 rounded-lg bg-[#F8F4F0] border-l-4 border-blue-400 transition-colors duration-200 hover:bg-[#f9f9f9]'>
          <div className='flex flex-col'>
            <span className='font-[400] text-[16px] text-gray-900'>
              Paid Bills
            </span>
            {summaryData.paidBills.count > 0 && (
              <span className='text-sm text-gray-500'>
                {summaryData.paidBills.count}{' '}
                {summaryData.paidBills.count === 1 ? 'bill' : 'bills'}
              </span>
            )}
          </div>
          <span className='font-bold text-[16px] text-gray-900'>
            {formatCurrency(summaryData.paidBills.amount)}
          </span>
        </div>

        {/* Total Upcoming */}
        <div className='flex items-center justify-between p-4 rounded-lg bg-[#F8F4F0] border-l-4 border-orange-400 transition-colors duration-200 hover:bg-[#f9f9f9]'>
          <div className='flex flex-col'>
            <span className='font-[400] text-[16px] text-gray-900'>
              Total Upcoming
            </span>
            {summaryData.totalUpcoming.count > 0 && (
              <span className='text-sm text-gray-500'>
                {summaryData.totalUpcoming.count}{' '}
                {summaryData.totalUpcoming.count === 1 ? 'bill' : 'bills'}
              </span>
            )}
          </div>
          <span className='font-bold text-[16px] text-gray-900'>
            {formatCurrency(summaryData.totalUpcoming.amount)}
          </span>
        </div>

        {/* Due Soon */}
        <div className='flex items-center justify-between p-4 rounded-lg bg-[#F8F4F0] border-l-4 border-green-400 transition-colors duration-200 hover:bg-[#f9f9f9]'>
          <div className='flex flex-col'>
            <span className='font-[400] text-[16px] text-gray-900'>
              Due Soon
            </span>
            {summaryData.dueSoon.count > 0 && (
              <span className='text-sm text-gray-500'>
                {summaryData.dueSoon.count}{' '}
                {summaryData.dueSoon.count === 1 ? 'bill' : 'bills'} in next 5
                days
              </span>
            )}
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
