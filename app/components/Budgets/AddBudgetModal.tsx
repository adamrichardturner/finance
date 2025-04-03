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
import { THEME_COLORS, getAvailableCategories } from '~/utils/budget-categories'
import { Budget } from '~/types/finance.types'

interface AddBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  budgets: Budget[]
}

export function AddBudgetModal({
  isOpen,
  onClose,
  budgets,
}: AddBudgetModalProps) {
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [theme, setTheme] = useState(THEME_COLORS[0].value)
  const [error, setError] = useState<string | null>(null)
  const { createBudget } = useBudgetMutations()

  useEffect(() => {
    if (!isOpen) {
      setCategory('')
      setAmount('')
      setTheme(THEME_COLORS[0].value)
      setError(null)
    }
  }, [isOpen])

  const availableCategories = getAvailableCategories(budgets)

  const handleCategoryChange = (newCategory: string) => {
    const normalizedNewCategory = newCategory.toLowerCase().trim()
    const isDuplicate = budgets.some(
      (budget) => budget.category.toLowerCase().trim() === normalizedNewCategory
    )

    if (isDuplicate) {
      setError(
        `A budget for "${newCategory}" already exists. Please select a different category.`
      )
    } else {
      setCategory(newCategory)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category || !amount || !theme) {
      setError('Please fill in all fields')
      return
    }

    const normalizedSelectedCategory = category.toLowerCase().trim()
    const isDuplicate = budgets.some(
      (budget) =>
        budget.category.toLowerCase().trim() === normalizedSelectedCategory
    )

    if (isDuplicate) {
      setError(
        `A budget for "${category}" already exists. Please select a different category.`
      )
      return
    }

    try {
      await createBudget.mutateAsync({
        category,
        maxAmount: parseFloat(amount),
        theme,
      })
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to create budget')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && (
            <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Budget Category</label>
            <Select
              value={category}
              onValueChange={handleCategoryChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a category'>
                  {category && (
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ backgroundColor: theme }}
                      />
                      {category}
                    </div>
                  )}
                </SelectValue>
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
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Maximum Spend</label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <span className='text-gray-500'>£</span>
              </div>
              <Input
                type='number'
                placeholder='e.g. 2000'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min='0'
                step='0.01'
                required
                className='pl-7'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Theme</label>
            <Select value={theme} onValueChange={setTheme} required>
              <SelectTrigger>
                <SelectValue>
                  {theme && (
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ backgroundColor: theme }}
                      />
                      <span>
                        {THEME_COLORS.find((color) => color.value === theme)
                          ?.name || 'Custom'}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {THEME_COLORS.map((color) => (
                  <SelectItem key={color.name} value={color.value}>
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type='submit'
            className='w-full bg-black text-white hover:bg-black/90'
            disabled={
              createBudget.isPending ||
              !!error ||
              !category ||
              !amount ||
              !theme
            }
          >
            {createBudget.isPending ? 'Creating...' : 'Add Budget'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
