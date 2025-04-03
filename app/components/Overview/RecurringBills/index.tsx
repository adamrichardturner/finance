import { Card, CardTitle, CardHeader } from '~/components/ui/card'
import Pointer from '../../../../public/assets/icons/Pointer.svg'
import { AppTransaction } from '~/utils/transform-data'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface RecurringBillsProps {
  bills: AppTransaction[]
  title?: string
}

const RecurringBills: React.FC<RecurringBillsProps> = ({
  bills,
  title = 'Recurring Bills',
}) => {
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

  // Placeholder values for summary data
  const summaryData = {
    paidBills: 190.0,
    totalUpcoming: 194.98,
    dueSoon: 59.98,
  }

  // Check if a bill is overdue
  const isOverdue = (bill: AppTransaction): boolean => {
    // Use the explicit isOverdue property if available
    if (bill.isOverdue !== undefined) {
      return bill.isOverdue
    }
    // Otherwise use the date to determine if it's overdue
    return new Date(bill.date) < new Date()
  }

  // Check if a bill is paid
  const isPaid = (bill: AppTransaction): boolean => {
    if (bill.isPaid !== undefined) {
      return bill.isPaid
    }
    return false
  }

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

  // Filter to only show recurring bills
  const recurringBills = bills.filter(
    (bill) => bill.recurring && bill.amount < 0
  )

  return (
    <Card className='p-[32px] flex flex-col gap-4 shadow-none flex-grow flex-1 h-full'>
      <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
        <CardTitle className='text-[20px]'>{title}</CardTitle>
        <div
          className='text-[14px] text-gray-500 cursor-pointer hover:text-black transition-colors flex flex-row gap-1'
          onClick={() => {}}
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
          <span className='font-[400] text-[16px] text-gray-900'>
            Paid Bills
          </span>
          <span className='font-bold text-[16px] text-gray-900'>
            {formatCurrency(summaryData.paidBills)}
          </span>
        </div>

        {/* Total Upcoming */}
        <div className='flex items-center justify-between p-4 rounded-lg bg-[#F8F4F0] border-l-4 border-orange-400 transition-colors duration-200 hover:bg-[#f9f9f9]'>
          <span className='font-[400] text-[16px] text-gray-900'>
            Total Upcoming
          </span>
          <span className='font-bold text-[16px] text-gray-900'>
            {formatCurrency(summaryData.totalUpcoming)}
          </span>
        </div>

        {/* Due Soon */}
        <div className='flex items-center justify-between p-4 rounded-lg bg-[#F8F4F0] border-l-4 border-green-400 transition-colors duration-200 hover:bg-[#f9f9f9]'>
          <span className='font-[400] text-[16px] text-gray-900'>Due Soon</span>
          <span className='font-bold text-[16px] text-gray-900'>
            {formatCurrency(summaryData.dueSoon)}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default RecurringBills
