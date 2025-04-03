import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

interface PillProps {
  title: string
  amount: string | number
  icon?: React.ReactNode
  isTotal?: boolean
  subtitle?: string
}

const Pill: React.FC<PillProps> = ({
  title,
  amount,
  icon,
  isTotal,
  subtitle,
}) => {
  return (
    <Card
      className={`max-h-[120px] ${isTotal ? 'bg-[#201F24] text-white' : 'bg-white'} shadow-none outline-none border-0`}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between'>
          <div>
            <div className='text-2xl font-bold'>{amount}</div>
          </div>
          {icon && <div>{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

export default Pill
