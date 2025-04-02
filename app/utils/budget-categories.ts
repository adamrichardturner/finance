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

// Get available categories that aren't used in existing budgets
export function getAvailableCategories(existingBudgets: any[] | undefined, currentBudgetId?: string, currentCategory?: string) {
    // If no budgets exist yet, return all categories
    if (!existingBudgets || existingBudgets.length === 0) {
        return BUDGET_CATEGORIES
    }

    // Extract all used category names (normalized to lowercase for comparison)
    const usedCategories = existingBudgets
        .filter(budget => currentBudgetId ? String(budget.id) !== currentBudgetId : true)
        .map(budget => budget.category.toLowerCase().trim())

    console.log('Used categories:', usedCategories)
    console.log('Current category:', currentCategory)

    return BUDGET_CATEGORIES.filter(cat => {
        const normalizedCatName = cat.name.toLowerCase().trim()

        // For edit mode: always include the current budget's category
        if (currentCategory && normalizedCatName === currentCategory.toLowerCase().trim()) {
            return true
        }

        // For both modes: exclude categories that are used by other budgets
        return !usedCategories.includes(normalizedCatName)
    })
}
