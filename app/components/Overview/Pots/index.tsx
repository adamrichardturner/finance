import { Card, CardTitle, CardHeader, CardContent } from '~/components/ui/card'
import { Pot } from '~/types/finance.types'
import { transformPotsToOverview } from '~/transformers/potTransformer'
import { PlusCircle } from 'lucide-react'

interface PotsProps {
  pots: Pot[]
}

interface PotTotal {
  total: string
}

const Pots: React.FC<PotsProps> = ({ pots }) => {
  const { formattedTotal } = transformPotsToOverview(pots)

  if (!pots || pots.length === 0) {
    return (
      <Card className='p-[32px] flex flex-col gap-4 shadow-none'>
        <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
          <CardTitle className='text-[20px]'>Pots</CardTitle>
          <div className='text-[14px] text-gray-500 cursor-pointer hover:text-black transition-colors items-center flex flex-row gap-1'>
            See Details
            <span>
              <img
                src='/assets/icons/Pointer.svg'
                alt='Pointer Icon'
                className='h-2 w-2 ml-2'
              />
            </span>
          </div>
        </CardHeader>
        <CardContent className='p-0 mt-4'>
          <div className='flex flex-col items-center justify-center h-[180px] text-center'>
            <PlusCircle className='w-12 h-12 text-gray-300 mb-3' />
            <p className='text-gray-500 font-medium'>
              No savings pots available
            </p>
            <p className='text-gray-400 text-sm mt-1'>
              Create pots to save for specific goals
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='p-[32px] flex flex-col gap-4 shadow-none'>
      <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
        <CardTitle className='text-[20px]'>Pots</CardTitle>
        <div className='text-[14px] text-gray-500 cursor-pointer hover:text-black transition-colors items-center flex flex-row gap-1'>
          See Details
          <span>
            <img
              src='/assets/icons/Pointer.svg'
              alt='Pointer Icon'
              className={`h-2 w-2 ml-2`}
            />
          </span>
        </div>
      </CardHeader>

      <div className='flex flex-col w-full flex-1 sm:flex-row gap-4'>
        <div className='flex justify-center w-full flex-1 sm:justify-start'>
          <PotTotal total={formattedTotal} />
        </div>

        <div className='hidden sm:block flex-1'>
          <PotGridSummary pots={pots} />
        </div>
      </div>

      <div className='sm:hidden mt-4'>
        <PotGridSmallScreen pots={pots} />
      </div>
    </Card>
  )
}

export default Pots

export const PotTotal: React.FC<PotTotal> = ({ total }) => {
  return (
    <div className='p-4 bg-[#F8F4F0] flex items-center w-full sm:w-full rounded-lg'>
      <div>
        <img
          src='/assets/icons/PiggyBank.svg'
          alt='Piggy Bank'
          className={`h-[40px] w-[40px] mb-1`}
        />
      </div>
      <div className='pl-[16px]'>
        <span className='text-color-grey-500 text-[14px]'>Total Saved</span>
        <h3 className='text-[32px] font-semibold'>{total}</h3>
      </div>
    </div>
  )
}

const PotGridSmallScreen: React.FC<PotsProps> = ({ pots }) => {
  if (!pots || pots.length <= 0) {
    return null
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className='grid grid-cols-2 gap-4'>
      {pots.slice(0, 4).map((pot) => (
        <div key={pot.id} className='relative w-full h-full pl-4'>
          <div
            className='absolute left-0 top-0 h-full w-1 rounded-full'
            style={{ backgroundColor: pot.theme }}
          />

          <div className='w-full rounded-lg flex flex-col justify-between h-full'>
            <span className='block font-semibold text-[12px] font-[400] text-[#696868]'>
              {pot.name}
            </span>
            <span className='block text-gray-700 font-[700] text-[14px]'>
              {formatCurrency(Number(pot.total))}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

const PotGridSummary: React.FC<PotsProps> = ({ pots }) => {
  if (!pots || pots.length <= 0) {
    return null
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className='bg-white flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4'>
      {pots.slice(0, 4).map((pot) => (
        <div key={pot.id} className='relative w-full h-full pl-4'>
          <div
            className='absolute left-0 top-0 h-full w-1 rounded-full'
            style={{ backgroundColor: pot.theme }}
          />

          <div className='w-full rounded-lg flex flex-col justify-between h-full'>
            <span className='block font-semibold text-[12px] font-[400] text-[#696868]'>
              {pot.name}
            </span>
            <span className='block text-gray-700 font-[700] text-[14px]'>
              {formatCurrency(Number(pot.total))}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
