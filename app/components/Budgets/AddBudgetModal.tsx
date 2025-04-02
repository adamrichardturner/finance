import { useState, useEffect } from 'react'
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
import { useBudgets } from '~/hooks/use-budgets'
import {
  BUDGET_CATEGORIES,
  getThemeForCategory,
} from '~/utils/budget-categories'

interface AddBudgetModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddBudgetModal({ isOpen, onClose }: AddBudgetModalProps) {
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const { createBudget } = useBudgetMutations()
  const { data: existingBudgets } = useBudgets()

  const usedCategories = existingBudgets?.map((budget) => budget.category) || []

  // Get available categories that haven't been used yet
  const availableCategories = BUDGET_CATEGORIES.filter(
    (cat) => !usedCategories.includes(cat.name)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createBudget.mutateAsync({
        category,
        maxAmount: parseFloat(amount),
        theme: getThemeForCategory(category),
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
            {availableCategories.length === 0 ? (
              <div className='p-3 bg-gray-100 rounded text-gray-600 text-sm'>
                You've already created budgets for all available categories.
              </div>
            ) : (
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder='Select a category' />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      <div className='flex items-center gap-2'>
                        <div
                          className='w-2 h-2 rounded-full'
                          style={{ backgroundColor: cat.theme }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
            disabled={
              createBudget.isPending || availableCategories.length === 0
            }
          >
            {createBudget.isPending ? 'Adding...' : 'Add Budget'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
