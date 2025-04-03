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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className='flex flex-col p-4 max-[640px]:pt-3'>
      {/* Paid Bills */}
      <div className='py-5 max-[640px]:py-3'>
        <div className='flex justify-between items-center'>
          <span className='text-[14px] text-gray-700'>Paid Bills</span>
          <span className='text-[14px] font-[600]'>
            {summary.paidCount} ({formatCurrency(summary.paidBills)})
          </span>
        </div>
      </div>

      <div className='border-t border-gray-200'></div>

      {/* Total Upcoming */}
      <div className='py-5 max-[640px]:py-3'>
        <div className='flex justify-between items-center'>
          <span className='text-[14px] text-gray-700'>Total Upcoming</span>
          <span className='text-[14px] font-[600]'>
            {summary.upcomingCount} ({formatCurrency(summary.totalUpcoming)})
          </span>
        </div>
      </div>

      <div className='border-t border-gray-200'></div>

      {/* Due Soon */}
      <div className='py-5 max-[640px]:py-3'>
        <div className='flex justify-between items-center'>
          <span className='text-[14px] text-[#C94736]'>Due Soon</span>
          <span className='text-[14px] font-medium text-[#C94736]'>
            {summary.dueSoonCount} ({formatCurrency(summary.dueSoon)})
          </span>
        </div>
      </div>
    </div>
  )
}

export default BillsSummary
