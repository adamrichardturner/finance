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

interface EditBudgetModalProps {
  isOpen: boolean
  budgetId?: string
  onClose: () => void
  budgets: Budget[]
  usedColors?: string[] // Colors already used by pots
  monthlyIncome?: number // Monthly income for validation
}

export function EditBudgetModal({
  isOpen,
  budgetId,
  onClose,
  budgets,
  usedColors = [],
  monthlyIncome = 0,
}: EditBudgetModalProps) {
  // PostgreSQL numeric limit (precision 10, scale 2)
  const MAX_BUDGET_AMOUNT = 99999999.99

  // Calculate total of existing budgets
  const totalBudgeted = useMemo(() => {
    return budgets.reduce((sum, budget) => sum + parseFloat(budget.maximum), 0)
  }, [budgets])

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
  const budgetColors = useMemo(() => {
    if (!budgets) return []
    return budgets
      .filter((budget) => String(budget.id) !== budgetId)
      .map((budget) => budget.theme)
  }, [budgets, budgetId])

  // Combine budget colors with external used colors
  const allUsedColors = useMemo(() => {
    return [...budgetColors, ...usedColors]
  }, [budgetColors, usedColors])

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

      // Get current budget to calculate difference
      const currentBudget = budgets.find((b) => String(b.id) === budgetId)
      if (currentBudget) {
        const currentAmount = parseFloat(currentBudget.maximum)

        // Calculate the new total (excluding current budget then adding the new amount)
        const totalWithoutCurrent = totalBudgeted - currentAmount
        const newTotal = totalWithoutCurrent + numericValue

        // Check if budget exceeds monthly income
        if (monthlyIncome > 0 && numericValue > monthlyIncome) {
          setError(
            `Budget cannot exceed your monthly income of ${formatCurrency(monthlyIncome)}`
          )
          return
        }

        // Check if new total would exceed monthly income
        if (monthlyIncome > 0 && newTotal > monthlyIncome) {
          setError(
            `Updating this budget would exceed your monthly income. New total would be ${formatCurrency(newTotal)}, Monthly income: ${formatCurrency(monthlyIncome)}`
          )
          return
        }
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

  const availableCategories = getAvailableCategories(
    budgets,
    budgetId,
    formState.original.category
  )

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

    // Check for duplicates (only if category has changed)
    if (
      formState.current.category.toLowerCase().trim() !==
      formState.original.category.toLowerCase().trim()
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
        return false
      }
    }

    // Parse amounts for validation
    const newAmount = parseFloat(formState.current.amount)
    if (isNaN(newAmount) || newAmount <= 0) {
      return false
    }

    // Check if amount exceeds PostgreSQL limit
    if (newAmount > MAX_BUDGET_AMOUNT) {
      return false
    }

    // Get current budget to calculate difference
    const currentBudget = budgets.find((b) => String(b.id) === budgetId)
    const currentAmount = currentBudget ? parseFloat(currentBudget.maximum) : 0

    // Calculate the new total (excluding current budget then adding the new amount)
    const totalWithoutCurrent = totalBudgeted - currentAmount
    const newTotal = totalWithoutCurrent + newAmount

    // Check if budget exceeds monthly income
    if (monthlyIncome > 0 && newAmount > monthlyIncome) {
      return false
    }

    // Check if new total would exceed monthly income
    if (monthlyIncome > 0 && newTotal > monthlyIncome) {
      return false
    }

    return true
  }, [
    formState.current,
    formState.original,
    budgets,
    budgetId,
    totalBudgeted,
    MAX_BUDGET_AMOUNT,
    monthlyIncome,
  ])

  // Update button's disabled state
  const isButtonDisabled = useMemo(() => {
    return updateBudget.isPending || !hasChanges || !isFormValid
  }, [updateBudget.isPending, hasChanges, isFormValid])

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

    // Parse amounts for validation
    const newAmount = parseFloat(formState.current.amount)

    // Check if amount exceeds PostgreSQL limit
    if (newAmount > MAX_BUDGET_AMOUNT) {
      setError(
        `Maximum amount cannot exceed ${formatCurrency(MAX_BUDGET_AMOUNT)}`
      )
      return
    }

    // Get current budget to calculate difference
    const currentBudget = budgets.find((b) => String(b.id) === budgetId)
    const currentAmount = currentBudget ? parseFloat(currentBudget.maximum) : 0
    const amountDifference = newAmount - currentAmount

    // Calculate the new total (excluding current budget then adding the new amount)
    const totalWithoutCurrent = totalBudgeted - currentAmount
    const newTotal = totalWithoutCurrent + newAmount

    // Check if budget exceeds monthly income
    if (monthlyIncome > 0 && newAmount > monthlyIncome) {
      setError(
        `Budget cannot exceed your monthly income of ${formatCurrency(monthlyIncome)}`
      )
      return
    }

    // Check if new total would exceed monthly income
    if (monthlyIncome > 0 && newTotal > monthlyIncome) {
      setError(
        `Updating this budget would exceed your monthly income. New total would be ${formatCurrency(newTotal)}, Monthly income: ${formatCurrency(monthlyIncome)}`
      )
      return
    }

    try {
      setError(null)
      await updateBudget.mutateAsync({
        id: parseInt(budgetId),
        category: formState.current.category,
        maxAmount: newAmount,
        theme: formState.current.theme,
        userId: 'temp', // Will be replaced by the session user ID on the server
      })

      // Always close the modal after server responds (successful)
      onClose()
    } catch (error) {
      // Only in case of errors, we keep the modal open
      const message =
        error instanceof Error ? error.message : 'Failed to update budget'
      setError(message)
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
            <label
              htmlFor='edit-budget-category'
              className='text-sm font-medium'
            >
              Budget Category
            </label>
            <Select
              value={formState.current.category}
              onValueChange={handleCategoryChange}
              required
            >
              <SelectTrigger id='edit-budget-category'>
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
            <label htmlFor='edit-max-spend' className='text-sm font-medium'>
              Maximum Spend
            </label>
            <CurrencyInput
              id='edit-max-spend'
              placeholder='e.g. 2,000.00'
              value={formState.current.amount}
              onChange={handleAmountChange}
              decimals={2}
              required
            />
          </div>

          <div className='space-y-2'>
            <label id='edit-theme-label' className='text-sm font-medium'>
              Theme
            </label>
            <div aria-labelledby='edit-theme-label'>
              <ColorSelect
                value={formState.current.theme}
                onValueChange={handleThemeChange}
                required
                usedColors={allUsedColors}
                allowCurrentColor
              />
            </div>
          </div>

          <Button
            type='submit'
            className='w-full bg-black text-white hover:bg-black/90'
            disabled={isButtonDisabled}
          >
            {updateBudget.isPending ? 'Saving...' : 'Save Budget'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
