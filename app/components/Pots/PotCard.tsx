import { useMemo, useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { MoreHorizontal, Plus, ArrowDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Pot } from '~/types/finance.types'
import { usePotMutations } from '~/hooks/use-pot-mutations'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Input } from '../ui/input'

interface PotCardProps {
  pot: Pot
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function PotCard({ pot, onEdit, onDelete }: PotCardProps) {
  // State for money operations dialogs
  const [addMoneyOpen, setAddMoneyOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Use the pot mutations hook
  const { addMoney, withdraw } = usePotMutations()

  // Calculate percentage with proper boundary checks
  const progressPercentage = useMemo(() => {
    if (pot.target <= 0) {
      return 0
    }

    const percentage = (pot.total / pot.target) * 100
    return Math.min(100, Math.max(0, percentage))
  }, [pot.total, pot.target])

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Handle adding money to pot
  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      await addMoney.mutateAsync({
        potId: String(pot.id),
        amount: numAmount,
      })
      setAmount('')
      setAddMoneyOpen(false)
    } catch (error) {
      console.error('Error adding money:', error)
      setError(error instanceof Error ? error.message : 'Failed to add money')
    }
  }

  // Handle withdrawing money from pot
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (numAmount > Number(pot.total)) {
      setError('Cannot withdraw more than the current balance')
      return
    }

    try {
      await withdraw.mutateAsync({
        potId: String(pot.id),
        amount: numAmount,
      })
      setAmount('')
      setWithdrawOpen(false)
    } catch (error) {
      console.error('Error withdrawing money:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to withdraw money'
      )
    }
  }

  // Reset state when closing dialogs
  const closeAddMoneyDialog = () => {
    setAddMoneyOpen(false)
    setAmount('')
    setError(null)
  }

  const closeWithdrawDialog = () => {
    setWithdrawOpen(false)
    setAmount('')
    setError(null)
  }

  return (
    <>
      <Card className='overflow-hidden shadow-none border-none'>
        <CardContent className='p-6'>
          <div className='flex justify-between items-center mb-4'>
            <div className='flex items-center gap-2'>
              <div
                className='w-2 h-2 rounded-full'
                style={{ backgroundColor: pot.theme }}
              />
              <h3 className='font-semibold text-lg'>{pot.name}</h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                  <MoreHorizontal className='h-4 w-4' />
                  <span className='sr-only'>Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => onEdit(String(pot.id))}>
                  Edit Pot
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(String(pot.id))}
                  className='text-red-600'
                >
                  Delete Pot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='space-y-4'>
            <div className='flex justify-between text-sm mb-1'>
              <span className='text-gray-500'>Total Saved</span>
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-2xl'>
                  {formatCurrency(pot.total)}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className='w-full bg-gray-100 rounded-full h-2'>
              <div
                className='h-2 rounded-full'
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: pot.theme,
                }}
              />
            </div>
            <div className='flex justify-between items-center text-xs text-gray-500'>
              <span className='font-semibold'>
                {progressPercentage.toFixed(1)}%
              </span>
              <span>Target of {formatCurrency(pot.target)}</span>
            </div>

            <div className='grid grid-cols-2 gap-4 mt-4'>
              <Button
                className='w-full bg-[rgba(248,244,240,1)] text-gray-900 hover:text-white hover:ring-1 min-h-[56px] hover:bg-[#201F24] hover:text-white hover:shadow-sm transition-all duration-200'
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.preventDefault()
                  setAddMoneyOpen(true)
                }}
              >
                <Plus className='h-4 w-4 mr-2' />
                Add Money
              </Button>
              <Button
                className='w-full bg-[rgba(248,244,240,0.95)] text-gray-900 hover:text-white hover:ring-1 min-h-[56px] hover:bg-[#201F24] hover:text-white hover:shadow-sm transition-all duration-200'
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.preventDefault()
                  setWithdrawOpen(true)
                }}
                disabled={pot.total <= 0}
              >
                <ArrowDown className='h-4 w-4 mr-2' />
                Withdraw
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Money Dialog */}
      <Dialog open={addMoneyOpen} onOpenChange={closeAddMoneyDialog}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Add to '{pot.name}'</DialogTitle>
          </DialogHeader>
          <div className='space-y-6 py-4'>
            <p className='text-sm text-gray-500'>
              Add money to your pot to keep it separate from your main balance.
              As soon as you add this money, it will be deducted from your
              current balance.
            </p>

            {error && (
              <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <label className='text-sm font-medium'>New Amount</label>
              <div className='text-3xl font-bold'>
                {formatCurrency(pot.total + (Number(amount) || 0))}
              </div>

              {/* Progress bar */}
              <div className='w-full bg-gray-100 rounded-full h-2 mt-4'>
                <div
                  className='h-2 rounded-full'
                  style={{
                    width: `${Math.min(100, ((pot.total + (Number(amount) || 0)) / pot.target) * 100)}%`,
                    backgroundColor: pot.theme,
                  }}
                />
              </div>
              <div className='flex justify-between items-center text-xs text-gray-500 mt-1'>
                <span className='font-semibold'>
                  {(
                    ((pot.total + (Number(amount) || 0)) / pot.target) *
                    100
                  ).toFixed(2)}
                  %
                </span>
                <span>Target of {formatCurrency(pot.target)}</span>
              </div>
            </div>

            <div className='space-y-2 mt-4'>
              <label className='text-sm font-medium'>Amount to Add</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <span className='text-gray-500'>£</span>
                </div>
                <Input
                  type='number'
                  placeholder='Enter amount'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min='0.01'
                  step='0.01'
                  className='pl-7'
                />
              </div>
            </div>
          </div>
          <Button
            onClick={handleAddMoney}
            disabled={addMoney.isPending || !amount || parseFloat(amount) <= 0}
            className='w-full bg-[#202020] text-white hover:bg-[#000000] py-6'
          >
            Confirm Addition
          </Button>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={closeWithdrawDialog}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Withdraw from '{pot.name}'</DialogTitle>
          </DialogHeader>
          <div className='space-y-6 py-4'>
            <p className='text-sm text-gray-500'>
              Withdraw from your pot to put money back in your main balance.
              This will reduce the amount you have in this pot.
            </p>

            {error && (
              <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <label className='text-sm font-medium'>New Amount</label>
              <div className='text-3xl font-bold'>
                {formatCurrency(Math.max(0, pot.total - (Number(amount) || 0)))}
              </div>

              {/* Progress bar */}
              <div className='w-full bg-gray-100 rounded-full h-2 mt-4'>
                <div
                  className='h-2 rounded-full'
                  style={{
                    width: `${Math.min(100, Math.max(0, (Math.max(0, pot.total - (Number(amount) || 0)) / pot.target) * 100))}%`,
                    backgroundColor: pot.theme,
                  }}
                />
              </div>
              <div className='flex justify-between items-center text-xs text-gray-500 mt-1'>
                <span className='font-semibold'>
                  {(
                    Math.max(
                      0,
                      (pot.total - (Number(amount) || 0)) / pot.target
                    ) * 100
                  ).toFixed(2)}
                  %
                </span>
                <span>Target of {formatCurrency(pot.target)}</span>
              </div>
            </div>

            <div className='space-y-2 mt-4'>
              <label className='text-sm font-medium'>Amount to Withdraw</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <span className='text-gray-500'>£</span>
                </div>
                <Input
                  type='number'
                  placeholder='Enter amount'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min='0.01'
                  step='0.01'
                  max={pot.total}
                  className='pl-7'
                />
              </div>
            </div>
          </div>
          <Button
            onClick={handleWithdraw}
            disabled={
              withdraw.isPending ||
              !amount ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) > pot.total
            }
            className='w-full bg-[#202020] text-white hover:bg-[#000000] py-6'
          >
            Confirm Withdrawal
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
