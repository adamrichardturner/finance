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
  getAvailableCategories,
} from '~/utils/budget-categories'
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
  const [error, setError] = useState<string | null>(null)
  const { createBudget } = useBudgetMutations()

  // Reset form when opening/closing modal
  useEffect(() => {
    if (!isOpen) {
      setCategory('')
      setAmount('')
      setError(null)
    }
  }, [isOpen])

  // Create a proper list of existing budget categories
  const existingBudgetCategories = budgets.map((budget) =>
    budget.category.toLowerCase().trim()
  )

  // Check if the selected category already exists in any budget
  const handleCategoryChange = (newCategory: string) => {
    const normalizedNewCategory = newCategory.toLowerCase().trim()
    const isDuplicate = existingBudgetCategories.includes(normalizedNewCategory)

    if (isDuplicate) {
      setError(
        `A budget for "${newCategory}" already exists. Please select a different category.`
      )
      // Don't update the category if it's a duplicate
    } else {
      setCategory(newCategory)
      setError(null)
    }
  }

  // Filter available categories to exclude ones that already have budgets
  const availableCategories = BUDGET_CATEGORIES.filter((cat) => {
    const normalizedCatName = cat.name.toLowerCase().trim()
    return !existingBudgetCategories.includes(normalizedCatName)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Final validation check before submitting
    const normalizedSelectedCategory = category.toLowerCase().trim()
    const isDuplicate = existingBudgetCategories.includes(
      normalizedSelectedCategory
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
        theme: getThemeForCategory(category),
      })
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to add budget')
      }
      console.error('Failed to add budget:', error)
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
            {availableCategories.length === 0 ? (
              <div className='text-amber-600 text-sm p-3 bg-amber-50 rounded-md'>
                All budget categories are already in use.
              </div>
            ) : (
              <Select
                value={category}
                onValueChange={handleCategoryChange}
                required
              >
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
              createBudget.isPending ||
              availableCategories.length === 0 ||
              !category ||
              !!error
            }
          >
            {createBudget.isPending ? 'Adding...' : 'Add Budget'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
