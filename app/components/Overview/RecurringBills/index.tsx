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

  // For this demo, we'll consider subscription categories as recurring
  // In a real app, we would have a proper recurring flag
  const isRecurring = (transaction: AppTransaction): boolean => {
    const subscriptionCategories = ['Utilities', 'Housing', 'Subscription']
    return (
      transaction.amount < 0 &&
      (transaction.description.toLowerCase().includes('bill') ||
        transaction.description.toLowerCase().includes('subscription') ||
        subscriptionCategories.includes(transaction.category))
    )
  }

  // Filter bills that are recurring
  const recurringBills = bills.filter(isRecurring)

  if (recurringBills.length === 0) {
    return null
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
      <div className='grid grid-cols-1 gap-4'>
        {recurringBills.slice(0, 3).map((bill, index) => (
          <div
            key={bill.id || index}
            className='flex items-center justify-between p-4 rounded-lg bg-[#F8F4F0]'
          >
            <div className='flex items-center'>
              <div className='w-10 h-10 rounded-full bg-white flex items-center justify-center mr-4'>
                <img
                  src={bill.avatar || ''}
                  alt={bill.description}
                  className='w-6 h-6 object-contain'
                />
              </div>
              <div>
                <h3 className='font-semibold text-[16px]'>
                  {bill.description}
                </h3>
                <p className='text-[#696868] text-[12px]'>{bill.category}</p>
              </div>
            </div>
            <div className='text-right'>
              <p className='font-semibold text-[16px] text-red-500'>
                -{formatCurrency(Math.abs(bill.amount))}
              </p>
              <p className='text-[#696868] text-[12px] font-semibold'>
                Monthly
              </p>
            </div>
          </div>
        ))}
        {recurringBills.length > 3 && (
          <div className='text-center mt-2'>
            <span className='text-[14px] text-[#696868] font-[500]'>
              +{recurringBills.length - 3} more bills
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}

export default RecurringBills
