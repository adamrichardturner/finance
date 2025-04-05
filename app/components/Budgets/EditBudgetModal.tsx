import { useEffect, useState, useMemo } from 'react'
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
import { useBudgetMutations } from '~/hooks/use-budgets/use-budget-mutations'
import { THEME_COLORS, getAvailableCategories } from '~/utils/budget-categories'
import { Budget } from '~/types/finance.types'
import isEqual from 'lodash/isEqual'
import { ColorSelect } from '~/components/ui/color-select'

interface BudgetFormValues {
  category: string
  amount: string
  theme: string
}

interface FormState {
  original: BudgetFormValues
  current: BudgetFormValues
}

interface EditBudgetModalProps {
  isOpen: boolean
  budgetId?: string
  onClose: () => void
  budgets: Budget[]
  usedColors?: string[] // Colors already used by pots
}

export function EditBudgetModal({
  isOpen,
  budgetId,
  onClose,
  budgets,
}: EditBudgetModalProps) {
  const { updateBudget } = useBudgetMutations()

  const [formState, setFormState] = useState<FormState>({
    original: {
      category: '',
      amount: '',
      theme: THEME_COLORS[0].value,
    },
    current: {
      category: '',
      amount: '',
      theme: THEME_COLORS[0].value,
    },
  })

  const [error, setError] = useState<string | null>(null)

  const hasChanges = useMemo(() => {
    return !isEqual(formState.original, formState.current)
  }, [formState])

  // Extract used colors from existing budgets (excluding current budget)
  const usedColors = useMemo(() => {
    if (!budgets) return []
    return budgets
      .filter((budget) => String(budget.id) !== budgetId)
      .map((budget) => budget.theme)
  }, [budgets, budgetId])

  useEffect(() => {
    if (isOpen && budgetId && budgets) {
      const currentBudget = budgets.find((b) => String(b.id) === budgetId)

      if (currentBudget) {
        const newValues = {
          category: currentBudget.category,
          amount: currentBudget.maximum,
          theme: currentBudget.theme,
        }

        setFormState({
          original: newValues,
          current: newValues,
        })
      }
    }
  }, [isOpen, budgetId, budgets])

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const handleCategoryChange = (newCategory: string) => {
    setFormState((prev) => ({
      ...prev,
      current: {
        ...prev.current,
        category: newCategory,
      },
    }))

    if (
      newCategory.toLowerCase().trim() ===
      formState.original.category.toLowerCase().trim()
    ) {
      setError(null)
      return
    }

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
      } else {
        setError(null)
      }
    } else {
      setError(null)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      current: {
        ...prev.current,
        amount: e.target.value,
      },
    }))
  }

  const handleThemeChange = (value: string) => {
    console.log('Theme changed to:', value)
    setFormState((prev) => ({
      ...prev,
      current: {
        ...prev.current,
        theme: value,
      },
    }))
  }

  const availableCategories = getAvailableCategories(
    budgets,
    budgetId,
    formState.original.category
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!budgetId) {
      return
    }

    if (
      formState.current.category.toLowerCase().trim() !==
        formState.original.category.toLowerCase().trim() &&
      budgets
    ) {
      const normalizedSelectedCategory = formState.current.category
        .toLowerCase()
        .trim()

      const isDuplicate = budgets.some(
        (budget) =>
          String(budget.id) !== budgetId &&
          budget.category.toLowerCase().trim() === normalizedSelectedCategory
      )

      if (isDuplicate) {
        setError(
          `A budget for "${formState.current.category}" already exists. Please select a different category.`
        )
        return
      }
    }

    try {
      console.log('Updating budget with theme:', formState.current.theme)
      await updateBudget.mutateAsync({
        budgetId,
        category: formState.current.category,
        maxAmount: parseFloat(formState.current.amount),
        theme: formState.current.theme,
      })
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to update budget')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
              value={formState.current.category}
              onValueChange={handleCategoryChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a category'>
                  {formState.current.category && (
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ backgroundColor: formState.current.theme }}
                      />
                      {formState.current.category}
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
                value={formState.current.amount}
                onChange={handleAmountChange}
                min='0'
                step='0.01'
                required
                className='pl-7'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Theme</label>
            <ColorSelect
              value={formState.current.theme}
              onValueChange={handleThemeChange}
              required
              usedColors={usedColors}
            />
          </div>

          <Button
            type='submit'
            className='w-full bg-black text-white hover:bg-black/90'
            disabled={
              updateBudget.isPending ||
              !!error ||
              !formState.current.category ||
              !hasChanges
            }
          >
            {updateBudget.isPending ? 'Saving...' : 'Save Budget'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
