export interface BudgetCategory {
  name: string
  theme: string
}

// Reduced list of 8 essential budget categories with their mapped colors
export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { name: 'Housing', theme: '#5E76BF' },
  { name: 'Transportation', theme: '#7C2742' },
  { name: 'Groceries', theme: '#B8E986' },
  { name: 'Utilities', theme: '#82C9D7' },
  { name: 'Healthcare', theme: '#4A90E2' },
  { name: 'Entertainment', theme: '#277C78' },
  { name: 'Dining Out', theme: '#F2CDAC' },
  { name: 'Personal Care', theme: '#626070' },
]

// Function to get theme color by category name
export function getThemeForCategory(categoryName: string): string {
  const category = BUDGET_CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  )
  return category?.theme || '#277C78' // Default color if not found
}
