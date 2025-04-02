import { Card, CardTitle, CardHeader } from '~/components/ui/card'
import Pointer from '../../../../public/assets/icons/Pointer.svg'
import { AppTransaction } from '~/utils/transform-data'

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
    }).format(amount)
  }

  // Placeholder values
  const summaryData = {
    paidBills: 190.0,
    totalUpcoming: 194.98,
    dueSoon: 59.98,
  }

  return (
    <Card className='p-[32px] flex flex-col gap-4 shadow-none flex-grow flex-1 h-full'>
      <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
        <CardTitle className='text-[20px]'>{title}</CardTitle>
        <div className='text-[14px] text-[#696868] font-[500] flex flex-row items-center justify-end gap-[12px]'>
          See Details
          <span>
            <img src={Pointer} alt='Pointer Icon' className={`h-2 w-2`} />
          </span>
        </div>
      </CardHeader>
      <div className='grid grid-cols-1 gap-4 mt-2'>
        {/* Paid Bills */}
        <div className='flex items-center justify-between p-4 rounded-lg bg-[#F8F4F0] border-l-4 border-blue-400 transition-colors duration-200 hover:bg-[#E8E4E0]'>
          <span className='font-semibold text-[16px] text-gray-900'>
            Paid Bills
          </span>
          <span className='font-bold text-[16px] text-gray-900'>
            {formatCurrency(summaryData.paidBills)}
          </span>
        </div>

        {/* Total Upcoming */}
        <div className='flex items-center justify-between p-4 rounded-lg bg-[#F8F4F0] border-l-4 border-orange-400 transition-colors duration-200 hover:bg-[#E8E4E0]'>
          <span className='font-semibold text-[16px] text-gray-900'>
            Total Upcoming
          </span>
          <span className='font-bold text-[16px] text-gray-900'>
            {formatCurrency(summaryData.totalUpcoming)}
          </span>
        </div>

        {/* Due Soon */}
        <div className='flex items-center justify-between p-4 rounded-lg bg-[#F8F4F0] border-l-4 border-green-400 transition-colors duration-200 hover:bg-[#E8E4E0]'>
          <span className='font-semibold text-[16px] text-gray-900'>
            Due Soon
          </span>
          <span className='font-bold text-[16px] text-gray-900'>
            {formatCurrency(summaryData.dueSoon)}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default RecurringBills
