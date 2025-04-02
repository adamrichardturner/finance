import { useEffect, useState } from 'react'
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
import {
  BUDGET_CATEGORIES,
  getThemeForCategory,
} from '~/utils/budget-categories'
import { Budget } from '~/types/finance.types'

interface EditBudgetModalProps {
  isOpen: boolean
  budgetId?: string
  onClose: () => void
  budgets: Budget[]
}

export function EditBudgetModal({
  isOpen,
  budgetId,
  onClose,
  budgets,
}: EditBudgetModalProps) {
  const { updateBudget } = useBudgetMutations()
  const [category, setCategory] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [originalCategory, setOriginalCategory] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Load budget data when modal opens
  useEffect(() => {
    if (!budgetId) {
      return
    }

    const budget = budgets.find((b) => String(b.id) === budgetId)
    if (budget) {
      setCategory(String(budget.category))
      setOriginalCategory(String(budget.category))
      setAmount(budget.maximum.toString())
      setError(null)
    }
  }, [budgetId, budgets])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null)
    }
  }, [isOpen])

  // Create a list of existing budget categories excluding the current one
  const existingBudgetCategories = budgets
    .filter((budget) => String(budget.id) !== budgetId)
    .map((budget) => budget.category.toLowerCase().trim())

  // Handle category change with validation
  const handleCategoryChange = (newCategory: string) => {
    // Always allow selecting the original category
    if (
      newCategory.toLowerCase().trim() === originalCategory.toLowerCase().trim()
    ) {
      setCategory(newCategory)
      setError(null)
      return
    }

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
  // but include the original category of the budget being edited
  const availableCategories = BUDGET_CATEGORIES.filter((cat) => {
    const normalizedCatName = cat.name.toLowerCase().trim()

    // Always include the original category
    if (normalizedCatName === originalCategory.toLowerCase().trim()) {
      return true
    }

    // Exclude categories that are used by other budgets
    return !existingBudgetCategories.includes(normalizedCatName)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!budgetId) {
      return
    }

    // Final check for duplicate category
    if (
      category.toLowerCase().trim() !== originalCategory.toLowerCase().trim()
    ) {
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
    }

    try {
      await updateBudget.mutateAsync({
        budgetId,
        category,
        maxAmount: parseFloat(amount),
      })
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to update budget')
      }
      console.error('Failed to update budget:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
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
            disabled={updateBudget.isPending || !!error || !category}
          >
            {updateBudget.isPending ? 'Saving...' : 'Save Budget'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
