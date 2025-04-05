import { useState, useMemo, useEffect } from 'react'
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
import { useFactories } from '~/factories'

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
  usedColors?: string[] // Colors already used by pots
}

export function AddBudgetModal({
  isOpen,
  onClose,
  budgets,
  usedColors: potsColors = [],
}: AddBudgetModalProps) {
  // Extract used colors from existing budgets and pots
  const allUsedColors = useMemo(() => {
    const budgetColors = budgets ? budgets.map((budget) => budget.theme) : []
    // Combine both budget colors and pot colors into a single array
    return [...budgetColors, ...potsColors]
  }, [budgets, potsColors])

  // Find the first available color that's not already used
  const findFirstAvailableColor = (): string => {
    for (const color of THEME_COLORS) {
      if (!allUsedColors.includes(color.value)) {
        return color.value
      }
    }
    // If all colors are used, return the first one as fallback
    return THEME_COLORS[0].value
  }

  const initialValues: BudgetFormValues = {
    category: '',
    amount: '',
    theme: findFirstAvailableColor(),
  }

  const [formState, setFormState] = useState<FormState>({
    original: initialValues,
    current: initialValues,
  })

  // Update the theme when used colors change
  useEffect(() => {
    if (
      !formState.current.theme ||
      allUsedColors.includes(formState.current.theme)
    ) {
      const nextAvailableColor = findFirstAvailableColor()
      setFormState((prev) => ({
        ...prev,
        current: {
          ...prev.current,
          theme: nextAvailableColor,
        },
        original: {
          ...prev.original,
          theme: nextAvailableColor,
        },
      }))
    }
  }, [allUsedColors, formState.current.theme])

  const [error, setError] = useState<string | null>(null)
  const { createBudget } = useBudgetMutations()
  const { budgets: budgetFactory } = useFactories()

  // Check if any fields have been modified from their initial state
  const hasChanges = useMemo(() => {
    return !isEqual(formState.original, formState.current)
  }, [formState])

  const resetForm = () => {
    // Reset with a fresh available color
    const nextAvailableColor = findFirstAvailableColor()
    setFormState({
      original: {
        ...initialValues,
        theme: nextAvailableColor,
      },
      current: {
        ...initialValues,
        theme: nextAvailableColor,
      },
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

  const validateForm = (): string | null => {
    // Basic form validation
    if (
      !formState.current.category ||
      !formState.current.amount ||
      !formState.current.theme
    ) {
      return 'Please fill in all fields'
    }

    const normalizedSelectedCategory = formState.current.category
      .toLowerCase()
      .trim()
    const isDuplicate = budgets.some(
      (budget) =>
        budget.category.toLowerCase().trim() === normalizedSelectedCategory
    )

    if (isDuplicate) {
      return `A budget for "${formState.current.category}" already exists. Please select a different category.`
    }

    // Use the factory for additional validation
    try {
      // Validate using factory without storing the result
      budgetFactory.create({
        category: formState.current.category,
        maxAmount: parseFloat(formState.current.amount),
        theme: formState.current.theme,
        userId: 'temporary', // Will be replaced by the server
      })

      // The factory will throw if validation fails, so if we reach here, it's valid
      return null
    } catch (error) {
      return error instanceof Error ? error.message : 'Invalid budget data'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate the form using our validator
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setError(null)
      await createBudget.mutateAsync({
        category: formState.current.category,
        maxAmount: parseFloat(formState.current.amount),
        theme: formState.current.theme,
        userId: 'temp', // Will be replaced by the session user ID on the server
      })

      // Always close the modal after server responds (successful)
      resetForm()
      onClose()
    } catch (error) {
      // Only in case of errors, we keep the modal open
      const message =
        error instanceof Error ? error.message : 'Failed to create budget'
      setError(message)
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
            <label htmlFor='budget-category' className='text-sm font-medium'>
              Budget Category
            </label>
            <Select
              value={formState.current.category}
              onValueChange={handleCategoryChange}
              required
            >
              <SelectTrigger id='budget-category'>
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
            <label htmlFor='max-spend' className='text-sm font-medium'>
              Maximum Spend
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <span className='text-gray-500'>£</span>
              </div>
              <Input
                id='max-spend'
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
            <label id='add-budget-theme-label' className='text-sm font-medium'>
              Theme
            </label>
            <div aria-labelledby='add-budget-theme-label'>
              <ColorSelect
                value={formState.current.theme}
                onValueChange={handleThemeChange}
                required
                usedColors={allUsedColors}
              />
            </div>
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
