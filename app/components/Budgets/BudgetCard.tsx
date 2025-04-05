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
import { useNavigate } from '@remix-run/react'
import { getThemeForCategory } from '~/utils/budget-categories'

interface BudgetCardProps {
  budget: Budget
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const navigate = useNavigate()
  const spentAmount =
    budget.transactions?.reduce(
      (total, transaction) => total + Math.abs(transaction.amount),
      0
    ) ?? 0
  const maximum = parseFloat(budget.maximum)
  const remainingAmount = maximum - spentAmount
  const percentage = (spentAmount / maximum) * 100

  const navigateToTransactions = () => {
    navigate(`/transactions?category=${encodeURIComponent(budget.category)}`)
  }

  const navigateToTransaction = (transactionName: string) => {
    navigate(
      `/transactions?category=${encodeURIComponent(budget.category)}&search=${encodeURIComponent(transactionName)}`
    )
  }

  return (
    <Card className='rounded-lg bg-white shadow-none outline-none space-y-2 p-6'>
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

        <div className='mt-4 space-y-4'>
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

        {budget.transactions && budget.transactions.length > 0 && (
          <div
            className='bg-[#F8F4F0] mt-6 p-6 rounded-lg space-y-4 cursor-pointer'
            onClick={navigateToTransactions}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigateToTransactions()
              }
            }}
            tabIndex={0}
            role='button'
          >
            <div className='flex items-center justify-between'>
              <h4 className='text-sm text-color-grey-900 text-[16px] font-[700]'>
                Latest Spending
              </h4>
              <span
                className='text-[14px] text-gray-500 cursor-pointer hover:text-black transition-colors flex items-center flex flex-row gap-1'
                onClick={(e) => {
                  e.stopPropagation()
                  navigateToTransactions()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    navigateToTransactions()
                  }
                }}
                tabIndex={0}
                role='button'
              >
                See All
                <span className='ml-2'>
                  <img
                    src='/assets/icons/Pointer.svg'
                    alt='Pointer Icon'
                    className='h-2 w-2'
                  />
                </span>
              </span>
            </div>
            <div className='mt-2'>
              {budget.transactions.slice(0, 3).map((transaction) => (
                <div
                  key={transaction.id}
                  className='flex items-center justify-between cursor-pointer hover:bg-white/60 transition-colors duration-200 py-3 px-2'
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToTransaction(transaction.name)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation()
                      navigateToTransaction(transaction.name)
                    }
                  }}
                  tabIndex={0}
                  role='button'
                >
                  <div className='flex items-center gap-3'>
                    <div className='relative h-12 w-12 rounded-full bg-gray-100 overflow-hidden'>
                      {transaction.avatar && (
                        <img
                          src={transaction.avatar}
                          alt=''
                          className='h-full w-full rounded-full object-cover'
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const fallbackDiv =
                              target.parentElement?.querySelector(
                                '.fallback-avatar'
                              )
                            if (
                              fallbackDiv &&
                              fallbackDiv instanceof HTMLElement
                            ) {
                              fallbackDiv.style.display = 'flex'
                            }
                          }}
                        />
                      )}
                      <div
                        className='fallback-avatar absolute inset-0 flex items-center justify-center text-white font-medium text-sm'
                        style={{
                          backgroundColor: getThemeForCategory(
                            transaction.category
                          ),
                          display: transaction.avatar ? 'none' : 'flex',
                        }}
                      >
                        {transaction.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <p className='text-xs sm:text-sm font-medium leading-none'>
                        {transaction.name}
                      </p>
                    </div>
                  </div>
                  <span className='text-sm text-gray-700'>
                    <div className='flex space-y-1.5 flex-col text-right'>
                      <p
                        className={`text-xs font-bold text-right ${transaction.amount >= 0 ? 'text-green-600' : 'text-gray-900'}`}
                      >
                        <span className='whitespace-nowrap'>
                          {transaction.amount >= 0 ? '+' : '-'}£
                          {Math.abs(transaction.amount).toFixed(2)}
                        </span>
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
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
