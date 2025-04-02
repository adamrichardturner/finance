export interface BudgetCategory {
  name: string
  theme: string
}

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

// Function to get theme color by category name
export function getThemeForCategory(categoryName: string): string {
  const category = BUDGET_CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  )
  return category?.theme || '#4361EE' // Default color if not found
}

// Get available categories that aren't used in existing budgets
export function getAvailableCategories(
  existingBudgets: any[] | undefined,
  currentBudgetId?: string,
  currentCategory?: string
) {
  // If no budgets exist yet, return all categories
  if (!existingBudgets || existingBudgets.length === 0) {
    return BUDGET_CATEGORIES
  }

  // Extract all used category names (normalized to lowercase for comparison)
  const usedCategories = existingBudgets
    .filter((budget) =>
      currentBudgetId ? String(budget.id) !== currentBudgetId : true
    )
    .map((budget) => budget.category.toLowerCase().trim())

  console.log('Used categories:', usedCategories)
  console.log('Current category:', currentCategory)

  return BUDGET_CATEGORIES.filter((cat) => {
    const normalizedCatName = cat.name.toLowerCase().trim()

    // For edit mode: always include the current budget's category
    if (
      currentCategory &&
      normalizedCatName === currentCategory.toLowerCase().trim()
    ) {
      return true
    }

    // For both modes: exclude categories that are used by other budgets
    return !usedCategories.includes(normalizedCatName)
  })
}
