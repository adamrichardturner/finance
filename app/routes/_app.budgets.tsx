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

    if (typeof category !== 'string' || typeof maxAmount !== 'string') {
      return json({ error: 'Invalid form data' }, { status: 400 })
    }

    try {
      const budget = await createBudget({
        userId,
        category,
        maxAmount: parseFloat(maxAmount),
        theme: '#277C78', // Default theme color
      })
      return json({ budget })
    } catch (error) {
      return json({ error: 'Failed to create budget' }, { status: 500 })
    }
  }

  if (intent === 'update') {
    const budgetId = formData.get('budgetId')
    const category = formData.get('category')
    const maxAmount = formData.get('maxAmount')

    if (
      typeof budgetId !== 'string' ||
      typeof category !== 'string' ||
      typeof maxAmount !== 'string'
    ) {
      return json({ error: 'Invalid form data' }, { status: 400 })
    }

    try {
      const budget = await updateBudget({
        id: parseInt(budgetId),
        userId,
        category,
        maxAmount: parseFloat(maxAmount),
      })
      return json({ budget })
    } catch (error) {
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
    <div className='w-full'>
      <Budgets budgets={budgets} actionData={actionData} />
    </div>
  )
}
