import React from 'react'

interface BillsSummaryProps {
  summary: {
    totalBills: number
    paidBills: number
    totalUpcoming: number
    dueSoon: number
    paidCount: number
    upcomingCount: number
    dueSoonCount: number
  }
}

const BillsSummary: React.FC<BillsSummaryProps> = ({ summary }) => {
  return (
    <div className='flex flex-col'>
      {/* Paid Bills */}
      <div className='py-5'>
        <div className='flex justify-between items-center'>
          <span className='text-base text-gray-700'>Paid Bills</span>
          <span className='text-base font-medium'>
            {summary.paidCount} (${summary.paidBills.toFixed(2)})
          </span>
        </div>
      </div>

      <div className='border-t border-gray-200'></div>

      {/* Total Upcoming */}
      <div className='py-5'>
        <div className='flex justify-between items-center'>
          <span className='text-base text-gray-700'>Total Upcoming</span>
          <span className='text-base font-medium'>
            {summary.upcomingCount} (${summary.totalUpcoming.toFixed(2)})
          </span>
        </div>
      </div>

      <div className='border-t border-gray-200'></div>

      {/* Due Soon */}
      <div className='py-5'>
        <div className='flex justify-between items-center'>
          <span className='text-base text-[#D6401C]'>Due Soon</span>
          <span className='text-base font-medium text-[#D6401C]'>
            {summary.dueSoonCount} (${summary.dueSoon.toFixed(2)})
          </span>
        </div>
      </div>
    </div>
  )
}

export default BillsSummary
