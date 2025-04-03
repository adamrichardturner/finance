import * as React from 'react'
import { cn } from '~/lib/utils'

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('w-full h-full', className)} {...props} />
  )
)
ChartContainer.displayName = 'ChartContainer'

// Define a more specific type for chart payload items
interface ChartPayloadItem {
  value: number
  name: string
  dataKey: string
  color: string
  payload?: Record<string, string | number>
  fill?: string
  stroke?: string
  strokeWidth?: number
  strokeDasharray?: string
}

interface ChartTooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: ChartPayloadItem[]
  label?: string
  formatter?: (value: number) => string
}

const ChartTooltipContent: React.FC<ChartTooltipContentProps> =
  React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
    ({ className, active, payload, label, formatter, ...props }, ref) => {
      if (!active || !payload?.length) {
        return null
      }

      return (
        <div
          ref={ref}
          className={cn(
            'rounded-lg border bg-background p-2 shadow-md',
            className
          )}
          {...props}
        >
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex flex-col'>
              <span className='text-[0.70rem] uppercase text-muted-foreground'>
                {label}
              </span>
            </div>
            <div className='flex flex-col'>
              {payload.map((item, index) => (
                <span
                  key={index}
                  className='flex items-center text-[0.8rem] font-bold text-muted-foreground'
                >
                  <span
                    className='mr-1 size-2 rounded-full'
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}:</span>{' '}
                  <span className='ml-1'>
                    {formatter ? formatter(item.value) : item.value}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    }
  )
ChartTooltipContent.displayName = 'ChartTooltipContent'

export { ChartContainer, ChartTooltipContent }
