export interface BudgetCategory {
  name: string
  theme: string
}

// Predefined color options for budget themes
export const THEME_COLORS = [
  { name: 'Green', value: '#277C78' },
  { name: 'Yellow', value: '#F2CDAC' },
  { name: 'Cyan', value: '#82C9D7' },
  { name: 'Navy', value: '#626070' },
  { name: 'Red', value: '#C94736' },
  { name: 'Purple', value: '#826CB0' },
  { name: 'Turquoise', value: '#597C7C' },
]

// Vibrant color palette that works well with white and gray backgrounds
export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { name: 'Housing', theme: '#4361EE' }, // Vibrant blue
  { name: 'Transportation', theme: '#F72585' }, // Bright pink
  { name: 'Groceries', theme: '#4CC9F0' }, // Cyan
  { name: 'Utilities', theme: '#7209B7' }, // Deep purple
  { name: 'Healthcare', theme: '#06D6A0' }, // Mint green
  { name: 'Entertainment', theme: '#FF9F1C' }, // Orange
  { name: 'Dining Out', theme: '#FB5607' }, // Tangerine
  { name: 'Personal Care', theme: '#3A86FF' }, // Royal blue
]

// Define categories that should never be available for budgets
export const EXCLUDED_BUDGET_CATEGORIES = ['Income']

// Function to get theme color by category name
export function getThemeForCategory(categoryName: string): string {
  const category = BUDGET_CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  )
  return category?.theme || THEME_COLORS[0].value // Default to first theme color if not found
}

// Get available categories that aren't used in existing budgets
export function getAvailableCategories(
  existingBudgets: any[] | undefined,
  currentBudgetId?: string,
  currentCategory?: string
) {
  // If no budgets exist yet, return all categories except excluded ones
  if (!existingBudgets || existingBudgets.length === 0) {
    return BUDGET_CATEGORIES.filter(
      (cat) =>
        !EXCLUDED_BUDGET_CATEGORIES.map((c) => c.toLowerCase()).includes(
          cat.name.toLowerCase()
        )
    )
  }

  // Extract all used category names (normalized to lowercase for comparison)
  const usedCategories = existingBudgets
    .filter((budget) =>
      currentBudgetId ? String(budget.id) !== currentBudgetId : true
    )
    .map((budget) => budget.category.toLowerCase().trim())

  // Get the current budget if we're editing
  const currentBudget = currentBudgetId
    ? existingBudgets.find((b) => String(b.id) === currentBudgetId)
    : undefined

  return BUDGET_CATEGORIES.filter((cat) => {
    const normalizedCatName = cat.name.toLowerCase().trim()

    // Skip excluded categories
    if (
      EXCLUDED_BUDGET_CATEGORIES.map((c) => c.toLowerCase()).includes(
        normalizedCatName
      )
    ) {
      return false
    }

    // For edit mode: always include the current budget's category
    if (
      currentCategory &&
      normalizedCatName === currentCategory.toLowerCase().trim()
    ) {
      // If this is the current category being edited, use its existing theme
      if (
        currentBudget &&
        currentBudget.category.toLowerCase().trim() === normalizedCatName
      ) {
        return { ...cat, theme: currentBudget.theme }
      }
      return true
    }

    // For both modes: exclude categories that are used by other budgets
    return !usedCategories.includes(normalizedCatName)
  }).map((cat) => {
    // If this is the current category being edited, use its existing theme
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
