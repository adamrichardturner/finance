import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { useBudgetMutations } from '~/hooks/use-budget-mutations'

interface AddBudgetModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddBudgetModal({ isOpen, onClose }: AddBudgetModalProps) {
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const { createBudget } = useBudgetMutations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createBudget.mutateAsync({
        category,
        maxAmount: parseFloat(amount),
        theme: '#277C78', // Default theme color
      })
      setCategory('')
      setAmount('')
      onClose()
    } catch (error) {
      console.error('Failed to create budget:', error)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCategory('')
      setAmount('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Budget Category</label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Entertainment'>Entertainment</SelectItem>
                <SelectItem value='Bills'>Bills</SelectItem>
                <SelectItem value='Dining Out'>Dining Out</SelectItem>
                <SelectItem value='Transportation'>Transportation</SelectItem>
                <SelectItem value='Personal Care'>Personal Care</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Maximum Amount</label>
            <Input
              type='number'
              placeholder='Enter amount'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min='0'
              step='0.01'
              required
            />
          </div>

          <Button
            type='submit'
            className='w-full bg-black text-white hover:bg-black/90'
            disabled={createBudget.isPending}
          >
            {createBudget.isPending ? 'Adding...' : 'Add Budget'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
