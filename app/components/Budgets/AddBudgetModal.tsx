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
  getAvailableCategories
} from '~/utils/budget-categories'

interface AddBudgetModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddBudgetModal({ isOpen, onClose }: AddBudgetModalProps) {
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { createBudget } = useBudgetMutations()
  const { data: existingBudgets, isLoading } = useBudgets()

  // Reset form when opening/closing modal
  useEffect(() => {
    if (!isOpen) {
      setCategory('')
      setAmount('')
      setError(null)
    }
  }, [isOpen])

  // Check if the selected category already exists in any budget
  const handleCategoryChange = (newCategory: string) => {
    if (!existingBudgets) {
      setCategory(newCategory)
      return
    }

    const normalizedNewCategory = newCategory.toLowerCase().trim()
    const isDuplicate = existingBudgets.some(
      budget => budget.category.toLowerCase().trim() === normalizedNewCategory
    )

    if (isDuplicate) {
      setError(`A budget for "${newCategory}" already exists. Please select a different category.`)
      // Don't update the category if it's a duplicate
    } else {
      setCategory(newCategory)
      setError(null)
    }
  }

  // Get available categories using the shared utility function
  const availableCategories = getAvailableCategories(existingBudgets)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Double-check for duplicate category before submission
    if (existingBudgets) {
      const normalizedCategory = category.toLowerCase().trim()
      const isDuplicate = existingBudgets.some(
        budget => budget.category.toLowerCase().trim() === normalizedCategory
      )

      if (isDuplicate) {
        setError(`A budget for "${category}" already exists. Please select a different category.`)
        return
      }
    }

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
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to create budget')
      }
      console.error('Failed to create budget:', error)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCategory('')
      setAmount('')
      setError(null)
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
          {error && (
            <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm'>
              {error}
            </div>
          )}
          
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Budget Category</label>
            {availableCategories.length === 0 ? (
              <div className='p-3 bg-gray-100 rounded text-gray-600 text-sm'>
                You've already created budgets for all available categories.
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
                  {BUDGET_CATEGORIES
                    .filter(cat => {
                      // Skip filtering if no existing budgets data
                      if (!existingBudgets) return true;
                      
                      // Check if this category is already used by any budget
                      return !existingBudgets.some(budget => 
                        budget.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
                      );
                    })
                    .map((cat) => (
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
