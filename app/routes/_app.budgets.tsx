import {
  type MetaFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from '@remix-run/node'
import { Budgets } from '~/components/Budgets'
import { requireUserId } from '~/services/auth/session.server'
import {
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgets,
} from '~/models/budget.server'
import { useActionData, useLoaderData } from '@remix-run/react'
import { Budget } from '~/types/finance.types'
import { getThemeForCategory } from '~/utils/budget-categories'

export const meta: MetaFunction = () => {
  return [
    { title: 'Budgets | Finance App' },
    { name: 'description', content: 'Manage your budgets' },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = String(await requireUserId(request))
  const budgets = await getBudgets(userId)
  return json({ budgets })
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = String(await requireUserId(request))
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'create') {
    const category = formData.get('category')
    const maxAmount = formData.get('maxAmount')
    const theme = formData.get('theme')

    if (typeof category !== 'string' || typeof maxAmount !== 'string') {
      return json({ error: 'Invalid form data' }, { status: 400 })
    }

    // If theme wasn't provided, get it from the category
    const themeColor =
      typeof theme === 'string' && theme ? theme : getThemeForCategory(category)

    try {
      const budget = await createBudget({
        userId,
        category,
        maxAmount: parseFloat(maxAmount),
        theme: themeColor,
      })
      return json({ budget })
    } catch (error) {
      // Check for duplicate category error
      if (error instanceof Error && error.message.includes('already exists')) {
        return json({ error: error.message }, { status: 400 })
      }
      return json({ error: 'Failed to create budget' }, { status: 500 })
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
      return json({ error: 'Invalid form data' }, { status: 400 })
    }

    try {
      const budget = await updateBudget({
        id: parseInt(budgetId),
        userId,
        category,
        maxAmount: parseFloat(maxAmount),
        theme,
      })
      return json({ budget })
    } catch (error) {
      // Check for duplicate category error
      if (error instanceof Error && error.message.includes('already exists')) {
        return json({ error: error.message }, { status: 400 })
      } else if (
        error instanceof Error &&
        error.message === 'Budget not found'
      ) {
        return json({ error: 'Budget not found' }, { status: 404 })
      }
      return json({ error: 'Failed to update budget' }, { status: 500 })
    }
  }

  if (intent === 'delete') {
    const budgetId = formData.get('budgetId')

    if (typeof budgetId !== 'string') {
      return json({ error: 'Invalid budget ID' }, { status: 400 })
    }

    try {
      await deleteBudget({ id: parseInt(budgetId), userId })
      return json({ success: true })
    } catch (error) {
      return json({ error: 'Failed to delete budget' }, { status: 500 })
    }
  }

  return json({ error: 'Invalid intent' }, { status: 400 })
}

export default function BudgetsRoute() {
  const { budgets } = useLoaderData<{ budgets: Budget[] }>()
  const actionData = useActionData<typeof action>()

  return (
    <div className='w-full mb-12 sm:my-[0px]'>
      <Budgets budgets={budgets} actionData={actionData} />
    </div>
  )
}
