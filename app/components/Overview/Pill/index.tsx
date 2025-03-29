import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

interface PillProps {
  title: string
  amount: string | number
  icon?: React.ReactNode
}

const Pill: React.FC<PillProps> = ({ title, amount, icon }) => {
  return (
    <Card
      className={`hover:bg-[#201F24] min-h-[120px] hover:text-white bg-white shadow-none outline-none border-0 transition-colors duration-200`}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between'>
          <div className='text-2xl font-bold'>{amount}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Pill
