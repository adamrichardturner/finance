import { useState, useEffect, useMemo } from 'react'
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
import isEqual from 'lodash/isEqual'

interface BudgetFormValues {
  category: string
  amount: string
  theme: string
}

interface FormState {
  original: BudgetFormValues
  current: BudgetFormValues
}

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
  const initialValues: BudgetFormValues = {
    category: '',
    amount: '',
    theme: THEME_COLORS[0].value,
  }

  const [formState, setFormState] = useState<FormState>({
    original: initialValues,
    current: initialValues,
  })

  const [error, setError] = useState<string | null>(null)
  const { createBudget } = useBudgetMutations()

  // Check if any fields have been modified from their initial state
  const hasChanges = useMemo(() => {
    return !isEqual(formState.original, formState.current)
  }, [formState])

  const resetForm = () => {
    setFormState({
      original: initialValues,
      current: initialValues,
    })
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

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
      setFormState((prev) => ({
        ...prev,
        current: {
          ...prev.current,
          category: newCategory,
        },
      }))
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
    setFormState((prev) => ({
      ...prev,
      current: {
        ...prev.current,
        theme: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formState.current.category ||
      !formState.current.amount ||
      !formState.current.theme
    ) {
      setError('Please fill in all fields')
      return
    }

    const normalizedSelectedCategory = formState.current.category
      .toLowerCase()
      .trim()
    const isDuplicate = budgets.some(
      (budget) =>
        budget.category.toLowerCase().trim() === normalizedSelectedCategory
    )

    if (isDuplicate) {
      setError(
        `A budget for "${formState.current.category}" already exists. Please select a different category.`
      )
      return
    }

    try {
      await createBudget.mutateAsync({
        category: formState.current.category,
        maxAmount: parseFloat(formState.current.amount),
        theme: formState.current.theme,
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
            <Select
              value={formState.current.theme}
              onValueChange={handleThemeChange}
              required
            >
              <SelectTrigger>
                <SelectValue>
                  {formState.current.theme && (
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ backgroundColor: formState.current.theme }}
                      />
                      <span>
                        {THEME_COLORS.find(
                          (color) => color.value === formState.current.theme
                        )?.name || 'Custom'}
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
              !formState.current.category ||
              !formState.current.amount ||
              !formState.current.theme ||
              !hasChanges
            }
          >
            {createBudget.isPending ? 'Creating...' : 'Add Budget'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
