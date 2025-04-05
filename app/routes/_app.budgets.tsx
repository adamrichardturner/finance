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
    // Also load pots to get their colors
    const pots = await getPots(userId)

    return data({ budgets, pots })
  } catch (error) {
    throw new Response('Error loading budgets', { status: 500 })
  }
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
      return data({ error: 'Invalid form data' }, { status: 400 })
    }

    if (category.toLowerCase() === 'income') {
      return data(
        { error: 'Income cannot be used as a budget category' },
        { status: 400 }
      )
    }

    const themeColor =
      typeof theme === 'string' && theme ? theme : getThemeForCategory(category)

    try {
      const budget = await createBudget({
        userId,
        category,
        maxAmount: parseFloat(maxAmount),
        theme: themeColor,
      })
      return data({ budget })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return data({ error: error.message }, { status: 400 })
      }
      return data({ error: 'Failed to create budget' }, { status: 500 })
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
      return data({ error: 'Invalid form data' }, { status: 400 })
    }

    if (category.toLowerCase() === 'income') {
      return data(
        { error: 'Income cannot be used as a budget category' },
        { status: 400 }
      )
    }

    try {
      const budget = await updateBudget({
        id: parseInt(budgetId),
        userId,
        category,
        maxAmount: parseFloat(maxAmount),
        theme,
      })
      return data({ budget })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return data({ error: error.message }, { status: 400 })
      } else if (
        error instanceof Error &&
        error.message === 'Budget not found'
      ) {
        return data({ error: 'Budget not found' }, { status: 404 })
      }
      return data({ error: 'Failed to update budget' }, { status: 500 })
    }
  }

  if (intent === 'delete') {
    const budgetId = formData.get('budgetId')

    if (typeof budgetId !== 'string') {
      return data({ error: 'Invalid budget ID' }, { status: 400 })
    }

    try {
      await deleteBudget({ id: parseInt(budgetId), userId })
      return data({ success: true })
    } catch (error) {
      return data({ error: 'Failed to delete budget' }, { status: 500 })
    }
  }

  return data({ error: 'Invalid intent' }, { status: 400 })
}

export default function BudgetsRoute() {
  const { budgets, pots } = useLoaderData<{ budgets: Budget[]; pots: Pot[] }>()
  const actionData = useActionData<typeof action>()

  return (
    <div className='w-full mb-12 sm:my-[0px]'>
      <Budgets budgets={budgets} pots={pots} actionData={actionData} />
    </div>
  )
}
