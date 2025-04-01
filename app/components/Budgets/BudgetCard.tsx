import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Budget } from '~/types/finance.types'
import { Card } from '../ui/card'
import { EllipsisIcon } from '../ui/icons/EllipsisIcon'
import { Progress } from '../ui/progress'

interface BudgetCardProps {
  budget: Budget
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const spentAmount =
    budget.transactions?.reduce(
      (total, transaction) => total + Math.abs(transaction.amount),
      0
    ) ?? 0
  const maximum = parseFloat(budget.maximum)
  const remainingAmount = maximum - spentAmount
  const percentage = (spentAmount / maximum) * 100

  return (
    <Card className='rounded-lg border bg-white shadow-none outline-none space-y-2 p-6'>
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-2'>
          <div
            className='h-2 w-2 rounded-full'
            style={{ backgroundColor: budget.theme }}
          />
          <h3 className='text-lg font-medium'>{budget.category}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEdit(String(budget.id))}>
              Edit Budget
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(String(budget.id))}
              className='text-red-600'
            >
              Delete Budget
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='mt-2'>
        <span className='text-[14px] text-gray-500 font-normal'>
          Maximum of £{maximum.toFixed(2)}
        </span>

        <div className='mt-4 space-y-6'>
          <Progress
            value={percentage}
            className='h-[32px] rounded-lg bg-[#F8F4F0]'
            style={
              {
                '--progress-foreground': budget.theme,
              } as React.CSSProperties
            }
          />
          <div className='mt-2 flex h-[42px] flex-row'>
            <div className='flex items-center gap-2 w-1/2'>
              <div
                className='h-full flex-col w-1 rounded-lg'
                style={{ backgroundColor: budget.theme }}
              />
              <div className='flex flex-col '>
                <span className='flex flex-col text-color-grey-500 text-[12px]'>
                  Spent
                </span>
                <span className='text-grey-900 font-[700] text-[14px] pt-[6px]'>
                  £{spentAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className='flex items-center gap-2 w-1/2'>
              <div className='h-full w-1 rounded-lg bg-[#F8F4F0]' />
              <div className='flex flex-col'>
                <span className='text-color-grey-500 text-[12px]'>
                  Remaining
                </span>
                <span className='text-grey-900 font-[700] text-[14px] pt-[6px]'>
                  £{remainingAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-6 bg-[#F8F4F0] p-6 rounded-lg space-y-8'>
          <div className='flex items-center justify-between'>
            <h4 className='text-sm text-color-grey-900 text-[16px] font-[700]'>
              Latest Spending
            </h4>
            <Button
              variant='link'
              className='text-sm text-color-grey-500 p-0 h-auto'
            >
              See All
            </Button>
          </div>
          <div className='mt-2 space-y-3'>
            {budget.transactions?.slice(0, 3).map((transaction, index) => (
              <div key={transaction.id}>
                <div className='flex items-center justify-between min-h-[56px]'>
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 rounded-full bg-gray-100'>
                      <img
                        src={transaction.avatar}
                        alt=''
                        className='h-full w-full rounded-full object-cover'
                      />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>{transaction.name}</p>
                    </div>
                  </div>
                  <span className='text-sm text-gray-700'>
                    <div className='flex space-y-1.5 flex-col'>
                      <p className='text-xs text-gray-900 font-[700] text-right'>
                        £{Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {new Date(transaction.date).toLocaleDateString(
                          'en-GB',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  </span>
                </div>
                {budget.transactions &&
                  index < budget.transactions.slice(0, 3).length - 1 && (
                    <div
                      className='h-[1px] w-full mt-3'
                      style={{
                        opacity: 0.15,
                        background: 'var(--color-grey-500, #696868)',
                      }}
                    />
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
