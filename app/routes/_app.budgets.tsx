import { type MetaFunction, ActionFunctionArgs, data } from '@remix-run/node'
import { Budgets } from '~/components/Budgets'
import { useFinancialData } from '~/hooks/use-financial-data'
import { requireUserId } from '~/services/auth/session.server'
import {
  createBudget,
  updateBudget,
  deleteBudget,
} from '~/models/budget.server'
import { useActionData } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [
    { title: 'Budgets | Finance App' },
    { name: 'description', content: 'Manage your budgets' },
  ]
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = String(await requireUserId(request))
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'create') {
    const category = formData.get('category')
    const maxAmount = formData.get('maxAmount')

    if (typeof category !== 'string' || typeof maxAmount !== 'string') {
      return data({ error: 'Invalid form data' }, { status: 400 })
    }

    try {
      const budget = await createBudget({
        userId,
        category,
        maxAmount: parseFloat(maxAmount),
        theme: '#277C78', // Default theme color
      })
      return data({ budget })
    } catch (error) {
      return data({ error: 'Failed to create budget' }, { status: 500 })
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
      return data({ error: 'Invalid form data' }, { status: 400 })
    }

    try {
      const budget = await updateBudget({
        id: parseInt(budgetId),
        userId,
        category,
        maxAmount: parseFloat(maxAmount),
      })
      return data({ budget })
    } catch (error) {
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
  const { financialData } = useFinancialData()
  const actionData = useActionData<typeof action>()

  return (
    <div className='w-full'>
      <Budgets actionData={actionData} />
    </div>
  )
}
