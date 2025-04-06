import { data, useActionData, useLoaderData } from '@remix-run/react'
import {
  LoaderFunctionArgs,
  MetaFunction,
  ActionFunctionArgs,
} from '@remix-run/node'
import { requireUserId } from '~/services/auth/session.server'
import { Budgets } from '~/components/Budgets'
import {
  getBudgets,
  deleteBudget,
  createBudget,
  updateBudget,
} from '~/models/budget.server'
import { Budget, Pot } from '~/types/finance.types'
import { getThemeForCategory } from '~/utils/budget-categories'
import { getPots } from '~/services/finance/finance.service'
import { getFinancialData } from '~/services/finance/finance.service'
import { formatCurrency } from '~/utils/number-formatter'

// Maximum PostgreSQL numeric value for budget precision 10, scale 2
const MAX_BUDGET_AMOUNT = 99999999.99

// Function to calculate the total of all budget maximums
function calculateTotalBudgets(budgets: Budget[]): number {
  return budgets.reduce((sum, budget) => sum + parseFloat(budget.maximum), 0)
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Budgets | Finance App' },
    { name: 'description', content: 'Manage your budgets' },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = String(await requireUserId(request))

  try {
    const budgets = await getBudgets(userId)
    const pots = await getPots(userId)

    // Get financial data to check income
    const financialData = await getFinancialData()
    const monthlyIncome = financialData.balance
      ? financialData.balance.income || 0
      : 0

    // Sort budgets by maximum spend in descending order
    const sortedBudgets = [...budgets].sort((a, b) => {
      const maxA = parseFloat(a.maximum)
      const maxB = parseFloat(b.maximum)
      return maxB - maxA // Descending order
    })

    // Sort pots by total saved in descending order
    const sortedPots = [...pots].sort((a, b) => {
      const totalA = Number(a.total)
      const totalB = Number(b.total)
      return totalB - totalA // Descending order
    })

    return data({ budgets: sortedBudgets, pots: sortedPots, monthlyIncome })
  } catch (error) {
    throw new Response('Error loading budgets', { status: 500 })
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = String(await requireUserId(request))
  const formData = await request.formData()
  const intent = formData.get('intent')

  // Get the financial data to check income
  const financialData = await getFinancialData()
  // Use the balance.income property which represents monthly income
  const monthlyIncome = financialData.balance
    ? financialData.balance.income || 0
    : 0
  const existingBudgets = await getBudgets(userId)
  const totalBudgeted = calculateTotalBudgets(existingBudgets)

  if (intent === 'create') {
    const category = formData.get('category')
    const maxAmount = formData.get('maxAmount')
    const theme = formData.get('theme')

    if (typeof category !== 'string' || typeof maxAmount !== 'string') {
      return data(
        { error: 'Invalid form data', success: false },
        { status: 400 }
      )
    }

    if (category.toLowerCase() === 'income') {
      return data(
        { error: 'Income cannot be used as a budget category', success: false },
        { status: 400 }
      )
    }

    const maxAmountValue = parseFloat(maxAmount)

    // Validate against PostgreSQL numeric limit
    if (maxAmountValue > MAX_BUDGET_AMOUNT) {
      return data(
        {
          error: `Maximum amount cannot exceed ${formatCurrency(MAX_BUDGET_AMOUNT)}`,
          success: false,
        },
        { status: 400 }
      )
    }

    // Check if this budget exceeds the monthly income
    if (maxAmountValue > monthlyIncome) {
      return data(
        {
          error: `Budget cannot exceed your monthly income of ${formatCurrency(monthlyIncome)}`,
          success: false,
        },
        { status: 400 }
      )
    }

    // Check if this budget would cause total budgets to exceed income
    if (totalBudgeted + maxAmountValue > monthlyIncome) {
      return data(
        {
          error: `Adding this budget would exceed your monthly income. Current total: ${formatCurrency(totalBudgeted)}, Monthly income: ${formatCurrency(monthlyIncome)}`,
          success: false,
        },
        { status: 400 }
      )
    }

    const themeColor =
      typeof theme === 'string' && theme ? theme : getThemeForCategory(category)

    try {
      const budget = await createBudget({
        userId,
        category,
        maxAmount: maxAmountValue,
        theme: themeColor,
      })
      return data({ budget, success: true })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return data({ error: error.message, success: false }, { status: 400 })
      }
      return data(
        { error: 'Failed to create budget', success: false },
        { status: 500 }
      )
    }
  }

  if (intent === 'update') {
    const budgetId = formData.get('budgetId')
    const category = formData.get('category')
    const maxAmount = formData.get('maxAmount')
    const theme = formData.get('theme')

    if (
      typeof budgetId !== 'string' ||
      typeof category !== 'string' ||
      typeof maxAmount !== 'string' ||
      typeof theme !== 'string'
    ) {
      return data(
        { error: 'Invalid form data', success: false },
        { status: 400 }
      )
    }

    if (category.toLowerCase() === 'income') {
      return data(
        { error: 'Income cannot be used as a budget category', success: false },
        { status: 400 }
      )
    }

    const maxAmountValue = parseFloat(maxAmount)
    const budgetIdValue = parseInt(budgetId)

    // Validate against PostgreSQL numeric limit
    if (maxAmountValue > MAX_BUDGET_AMOUNT) {
      return data(
        {
          error: `Maximum amount cannot exceed ${formatCurrency(MAX_BUDGET_AMOUNT)}`,
          success: false,
        },
        { status: 400 }
      )
    }

    // Get the current budget to calculate the difference
    const currentBudget = existingBudgets.find((b) => b.id === budgetIdValue)
    const currentAmount = currentBudget ? parseFloat(currentBudget.maximum) : 0
    const diff = maxAmountValue - currentAmount

    // Check if this budget exceeds the monthly income
    if (maxAmountValue > monthlyIncome) {
      return data(
        {
          error: `Budget cannot exceed your monthly income of ${formatCurrency(monthlyIncome)}`,
          success: false,
        },
        { status: 400 }
      )
    }

    // Check if this budget update would cause total budgets to exceed income
    if (totalBudgeted + diff > monthlyIncome) {
      return data(
        {
          error: `Updating this budget would exceed your monthly income. Current total: ${formatCurrency(totalBudgeted)}, Monthly income: ${formatCurrency(monthlyIncome)}`,
          success: false,
        },
        { status: 400 }
      )
    }

    try {
      const budget = await updateBudget({
        id: budgetIdValue,
        userId,
        category,
        maxAmount: maxAmountValue,
        theme,
      })
      return data({ budget, success: true })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return data({ error: error.message, success: false }, { status: 400 })
      } else if (
        error instanceof Error &&
        error.message === 'Budget not found'
      ) {
        return data(
          { error: 'Budget not found', success: false },
          { status: 404 }
        )
      }
      return data(
        { error: 'Failed to update budget', success: false },
        { status: 500 }
      )
    }
  }

  if (intent === 'delete') {
    const budgetId = formData.get('budgetId')

    if (typeof budgetId !== 'string') {
      return data(
        { error: 'Invalid budget ID', success: false },
        { status: 400 }
      )
    }

    try {
      await deleteBudget({ id: parseInt(budgetId), userId })
      return data({ success: true })
    } catch (error) {
      return data(
        { error: 'Failed to delete budget', success: false },
        { status: 500 }
      )
    }
  }

  return data({ error: 'Invalid intent', success: false }, { status: 400 })
}

export default function BudgetsRoute() {
  const { budgets, pots, monthlyIncome } = useLoaderData<{
    budgets: Budget[]
    pots: Pot[]
    monthlyIncome: number
  }>()
  const actionData = useActionData<typeof action>()

  return (
    <div className='w-full mb-12 sm:my-[0px]'>
      <Budgets
        budgets={budgets}
        pots={pots}
        monthlyIncome={monthlyIncome}
        actionData={actionData}
      />
    </div>
  )
}
