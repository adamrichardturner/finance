import { Budget } from '~/types/finance.types'

export interface BudgetCategory {
  name: string
  theme: string
}

export const THEME_COLORS = [
  { name: 'Green', value: '#277C78' },
  { name: 'Yellow', value: '#F2CDAC' },
  { name: 'Cyan', value: '#82C9D7' },
  { name: 'Navy', value: '#626070' },
  { name: 'Red', value: '#C94736' },
  { name: 'Purple', value: '#826CB0' },
  { name: 'Turquoise', value: '#597C7C' },
  { name: 'Brown', value: '#9B6B43' },
  { name: 'Magenta', value: '#7C2742' },
  { name: 'Blue', value: '#4A90E2' },
  { name: 'Navy Grey', value: '#8091A5' },
  { name: 'Army Green', value: '#667D5C' },
  { name: 'Pink', value: '#E07A97' },
  { name: 'Gold', value: '#D4AF37' },
  { name: 'Orange', value: '#F5A623' },
]

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { name: 'Housing', theme: '#4361EE' },
  { name: 'Transportation', theme: '#F72585' },
  { name: 'Groceries', theme: '#4CC9F0' },
  { name: 'Utilities', theme: '#7209B7' },
  { name: 'Healthcare', theme: '#06D6A0' },
  { name: 'Entertainment', theme: '#FF9F1C' },
  { name: 'Dining Out', theme: '#FB5607' },
  { name: 'Personal Care', theme: '#3A86FF' },
  { name: 'Bills', theme: '#FF9F1C' },
]

export const EXCLUDED_BUDGET_CATEGORIES = ['Income']

export function getThemeForCategory(categoryName: string): string {
  const category = BUDGET_CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  )
  return category?.theme || THEME_COLORS[0].value
}

export function getAvailableCategories(
  existingBudgets: Budget[] | undefined,
  currentBudgetId?: string,
  currentCategory?: string
) {
  if (!existingBudgets || existingBudgets.length === 0) {
    return BUDGET_CATEGORIES.filter(
      (cat) =>
        !EXCLUDED_BUDGET_CATEGORIES.map((c) => c.toLowerCase()).includes(
          cat.name.toLowerCase()
        )
    )
  }

  const usedCategories = existingBudgets
    .filter((budget) =>
      currentBudgetId ? String(budget.id) !== currentBudgetId : true
    )
    .map((budget) => budget.category.toLowerCase().trim())

  const currentBudget = currentBudgetId
    ? existingBudgets.find((b) => String(b.id) === currentBudgetId)
    : undefined

  // Create a working copy of budget categories that may include the current category
  const workingCategories = [...BUDGET_CATEGORIES]

  // If current budget has a category not in our predefined list, add it
  if (
    currentBudget &&
    !BUDGET_CATEGORIES.some(
      (cat) =>
        cat.name.toLowerCase().trim() ===
        currentBudget.category.toLowerCase().trim()
    )
  ) {
    workingCategories.push({
      name: currentBudget.category,
      theme: currentBudget.theme,
    })
  }

  return workingCategories
    .filter((cat) => {
      const normalizedCatName = cat.name.toLowerCase().trim()

      if (
        EXCLUDED_BUDGET_CATEGORIES.map((c) => c.toLowerCase()).includes(
          normalizedCatName
        )
      ) {
        return false
      }

      if (
        currentCategory &&
        normalizedCatName === currentCategory.toLowerCase().trim()
      ) {
        if (
          currentBudget &&
          currentBudget.category.toLowerCase().trim() === normalizedCatName
        ) {
          return { ...cat, theme: currentBudget.theme }
        }
        return true
      }

      return !usedCategories.includes(normalizedCatName)
    })
    .map((cat) => {
      if (
        currentBudget &&
        cat.name.toLowerCase().trim() ===
          currentBudget.category.toLowerCase().trim()
      ) {
        return { ...cat, theme: currentBudget.theme }
      }
      return cat
    })
}
