import { Card, CardTitle, CardContent, CardHeader } from '~/components/ui/card'
import Pointer from '../../../../public/assets/icons/Pointer.svg'
import DollarJar from '../../../../public/assets/icons/DollarJar.svg'
import { Pot } from '~/types/finance.types'
import { transformPotsToOverview } from '~/transformers/potTransformer'

interface PotsProps {
  pots: Pot[]
}

interface PotTotal {
  total: string
}

const Pots: React.FC<PotsProps> = ({ pots }) => {
  const { formattedTotal } = transformPotsToOverview(pots)

  if (!pots) {
    return null
  }

  return (
    <Card className='p-[32px] flex flex-col gap-4 shadow-none'>
      <CardHeader className='flex p-0 flex-row justify-between items-center w-full'>
        <CardTitle className='text-[20px]'>Pots</CardTitle>
        <div className='text-[14px] text-[#696868] font-[500] flex flex-row items-center justify-end gap-[12px]'>
          See Details
          <span>
            <img src={Pointer} alt='Pointer Icon' className={`h-2 w-2`} />
          </span>
        </div>
      </CardHeader>
      <div className='flex flex-row gap-4'>
        <PotTotal total={formattedTotal} />
        <PotGridSummary pots={pots} />
      </div>
    </Card>
  )
}

export default Pots

export const PotTotal: React.FC<PotTotal> = ({ total }) => {
  return (
    <div className='p-4 bg-[#F8F4F0] flex items-center w-5/12 rounded-lg'>
      <div>
        <img
          src={DollarJar}
          alt='Money Pot'
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

const PotGridSummary: React.FC<PotsProps> = ({ pots }) => {
  if (!pots || pots.length <= 0) {
    return null
  }

  return (
    <div className='bg-white flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4'>
      {pots.slice(0, 4).map((pot) => (
        <div key={pot.id} className='relative w-full h-full pl-4'>
          {/* Vertical capsule border */}
          <div
            className='absolute left-0 top-0 h-full w-1 rounded-full'
            style={{ backgroundColor: pot.theme }}
          />

          {/* Content container */}
          <div className='w-full rounded-lg flex flex-col justify-between h-full'>
            <span className='block font-semibold text-[12px] font-[400] text-[#696868]'>
              {pot.name}
            </span>
            <span className='block text-gray-700 font-[700] text-[14px]'>
              £{pot.total}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
