import { useState, useMemo, useEffect, useCallback } from 'react'
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
import { CurrencyInput } from '~/components/ui/currency-input'
import { formatCurrency } from '~/utils/number-formatter'

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
  monthlyIncome?: number // Monthly income for validation
}

export function AddBudgetModal({
  isOpen,
  onClose,
  budgets,
  usedColors: potsColors = [],
  monthlyIncome = 0,
}: AddBudgetModalProps) {
  // PostgreSQL numeric limit (precision 10, scale 2)
  const MAX_BUDGET_AMOUNT = 99999999.99

  // Calculate total of existing budgets
  const totalBudgeted = useMemo(() => {
    return budgets.reduce((sum, budget) => sum + parseFloat(budget.maximum), 0)
  }, [budgets])

  // Extract used colors from existing budgets and pots
  const allUsedColors = useMemo(() => {
    const budgetColors = budgets ? budgets.map((budget) => budget.theme) : []
    // Combine both budget colors and pot colors into a single array
    return [...budgetColors, ...potsColors]
  }, [budgets, potsColors])

  // Find the first available color that's not already used
  const findFirstAvailableColor = useCallback((): string => {
    for (const color of THEME_COLORS) {
      if (!allUsedColors.includes(color.value)) {
        return color.value
      }
    }
    // If all colors are used, return the first one as fallback
    return THEME_COLORS[0].value
  }, [allUsedColors])

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
  }, [allUsedColors, formState, findFirstAvailableColor])

  const [error, setError] = useState<string | null>(null)
  const { createBudget } = useBudgetMutations()
  const { budgets: budgetFactory } = useFactories()

  // Check if any fields have been modified from their initial state
  const hasChanges = useMemo(() => {
    return !isEqual(formState.original, formState.current)
  }, [formState])

  // Check if current form values are valid (but don't set error messages)
  const isFormValid = useMemo(() => {
    // Basic form validation
    if (
      !formState.current.category ||
      !formState.current.amount ||
      !formState.current.theme
    ) {
      return false
    }

    // Check for duplicates
    const normalizedSelectedCategory = formState.current.category
      .toLowerCase()
      .trim()
    const isDuplicate = budgets.some(
      (budget) =>
        budget.category.toLowerCase().trim() === normalizedSelectedCategory
    )
    if (isDuplicate) {
      return false
    }

    // Parse the amount for numeric validation
    const amount = parseFloat(formState.current.amount)
    if (isNaN(amount) || amount <= 0) {
      return false
    }

    // Check if amount exceeds PostgreSQL limit
    if (amount > MAX_BUDGET_AMOUNT) {
      return false
    }

    // Check if amount exceeds monthly income
    if (monthlyIncome > 0 && amount > monthlyIncome) {
      return false
    }

    // Check if this would cause total to exceed monthly income
    if (monthlyIncome > 0 && totalBudgeted + amount > monthlyIncome) {
      return false
    }

    return true
  }, [
    formState.current,
    budgets,
    MAX_BUDGET_AMOUNT,
    monthlyIncome,
    totalBudgeted,
  ])

  // Update button's disabled state
  const isButtonDisabled = useMemo(() => {
    return createBudget.isPending || !hasChanges || !isFormValid
  }, [createBudget.isPending, hasChanges, isFormValid])

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

  const handleAmountChange = (value: string, numericValue: number) => {
    setFormState((prev) => ({
      ...prev,
      current: {
        ...prev.current,
        amount: value,
      },
    }))

    // Perform real-time validation
    if (value) {
      // Check if amount exceeds PostgreSQL limit
      if (numericValue > MAX_BUDGET_AMOUNT) {
        setError(
          `Maximum amount cannot exceed ${formatCurrency(MAX_BUDGET_AMOUNT)}`
        )
        return
      }

      // Check if amount exceeds monthly income
      if (monthlyIncome > 0 && numericValue > monthlyIncome) {
        setError(
          `Budget cannot exceed your monthly income of ${formatCurrency(monthlyIncome)}`
        )
        return
      }

      // Check if this would cause total to exceed monthly income
      if (monthlyIncome > 0 && totalBudgeted + numericValue > monthlyIncome) {
        setError(
          `Adding this budget would exceed your monthly income. Current total: ${formatCurrency(totalBudgeted)}, Monthly income: ${formatCurrency(monthlyIncome)}`
        )
        return
      }
    }

    // If we get here, clear any previous errors
    setError(null)
  }

  const handleThemeChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      current: {
        ...prev.current,
        theme: value,
      },
    }))
    // Clear error when user changes the theme
    setError(null)
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

    // Parse the amount for numeric validation
    const amount = parseFloat(formState.current.amount)

    // Check if amount exceeds PostgreSQL limit
    if (amount > MAX_BUDGET_AMOUNT) {
      return `Maximum amount cannot exceed ${formatCurrency(MAX_BUDGET_AMOUNT)}`
    }

    // Check if amount exceeds monthly income
    if (monthlyIncome > 0 && amount > monthlyIncome) {
      return `Budget cannot exceed your monthly income of ${formatCurrency(monthlyIncome)}`
    }

    // Check if this would cause total to exceed monthly income
    if (monthlyIncome > 0 && totalBudgeted + amount > monthlyIncome) {
      return `Adding this budget would exceed your monthly income. Current total: ${formatCurrency(totalBudgeted)}, Monthly income: ${formatCurrency(monthlyIncome)}`
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
            <CurrencyInput
              id='max-spend'
              placeholder='e.g. 2,000.00'
              value={formState.current.amount}
              onChange={handleAmountChange}
              decimals={2}
              required
            />
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
            disabled={isButtonDisabled}
          >
            {createBudget.isPending ? 'Creating...' : 'Add Budget'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
