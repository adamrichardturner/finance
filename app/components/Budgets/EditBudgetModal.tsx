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
import { useFinancialData } from '~/hooks/use-financial-data'
import { useBudgetMutations } from '~/hooks/use-budget-mutations'
import { useBudgets } from '~/hooks/use-budgets'
import {
  BUDGET_CATEGORIES,
  getThemeForCategory,
  getAvailableCategories,
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

  // Load budget data when budgetId changes or modal opens
  useEffect(() => {
    if (isOpen && budgetId && budgets) {
      const currentBudget = budgets.find((b) => String(b.id) === budgetId)

      if (currentBudget) {
        setCategory(currentBudget.category)
        setOriginalCategory(currentBudget.category)
        setAmount(currentBudget.maximum)
      }
    }
  }, [isOpen, budgetId, budgets])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null)
    }
  }, [isOpen])

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

    // Check if the new category is already used by another budget
    if (budgets) {
      const normalizedNewCategory = newCategory.toLowerCase().trim()

      const isDuplicate = budgets.some(
        (budget) =>
          String(budget.id) !== budgetId &&
          budget.category.toLowerCase().trim() === normalizedNewCategory
      )

      if (isDuplicate) {
        setError(
          `A budget for "${newCategory}" already exists. Please select a different category.`
        )
        // Don't update the category if it's a duplicate
      } else {
        setCategory(newCategory)
        setError(null)
      }
    } else {
      setCategory(newCategory)
    }
  }

  // Get available categories using the shared utility function
  const availableCategories = getAvailableCategories(
    budgets,
    budgetId,
    originalCategory
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!budgetId) {
      return
    }

    // Final check for duplicate category
    if (
      category.toLowerCase().trim() !== originalCategory.toLowerCase().trim() &&
      budgets
    ) {
      const normalizedSelectedCategory = category.toLowerCase().trim()

      const isDuplicate = budgets.some(
        (budget) =>
          String(budget.id) !== budgetId &&
          budget.category.toLowerCase().trim() === normalizedSelectedCategory
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
        theme: getThemeForCategory(category),
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
