import {
  type MetaFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
  data,
} from '@remix-run/node'
import { Pots } from '~/components/Pots'
import { requireUserId } from '~/services/auth/session.server'
import { useActionData, useLoaderData, useRevalidator } from '@remix-run/react'
import {
  getPots,
  createPot,
  updatePot,
  deletePot,
  updatePotBalance,
  getFinancialData,
} from '~/services/finance/finance.service'

export const meta: MetaFunction = () => {
  return [
    { title: 'Pots | Finance App' },
    { name: 'description', content: 'Manage your savings pots' },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = String(await requireUserId(request))

  try {
    const pots = await getPots(userId)
    // Get financial data to get budgets for colors
    const financialData = await getFinancialData()
    const currentBalance = Number(financialData.balance?.current || 0)
    const budgets = financialData.budgets || []

    return data({ pots, currentBalance, budgets })
  } catch (error) {
    console.error('Error fetching pots:', error)
    return data(
      {
        pots: [],
        currentBalance: 0,
        budgets: [],
        error: 'Failed to fetch pots',
      },
      { status: 500 }
    )
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = String(await requireUserId(request))
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'create') {
    const name = formData.get('name')
    const target = formData.get('target')
    const theme = formData.get('theme')

    if (
      typeof name !== 'string' ||
      typeof target !== 'string' ||
      typeof theme !== 'string'
    ) {
      return data({ error: 'Invalid form data' }, { status: 400 })
    }

    try {
      const pot = await createPot({
        userId,
        name,
        target: parseFloat(target),
        theme,
      })
      return data({ success: true, pot })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return data({ error: error.message }, { status: 400 })
      }
      return data({ error: 'Failed to create pot' }, { status: 500 })
    }
  }

  if (intent === 'update') {
    const potId = formData.get('potId')
    const name = formData.get('name')
    const target = formData.get('target')
    const theme = formData.get('theme')

    if (
      typeof potId !== 'string' ||
      typeof name !== 'string' ||
      typeof target !== 'string' ||
      typeof theme !== 'string'
    ) {
      return data({ error: 'Invalid form data' }, { status: 400 })
    }

    try {
      const pot = await updatePot({
        id: parseInt(potId),
        userId,
        name,
        target: parseFloat(target),
        theme,
      })
      return data({ success: true, pot })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return data({ error: error.message }, { status: 400 })
      } else if (error instanceof Error && error.message === 'Pot not found') {
        return data({ error: 'Pot not found' }, { status: 404 })
      }
      return data({ error: 'Failed to update pot' }, { status: 500 })
    }
  }

  if (intent === 'delete') {
    const potId = formData.get('potId')

    if (typeof potId !== 'string') {
      return data({ error: 'Invalid pot ID' }, { status: 400 })
    }

    try {
      await deletePot({ id: parseInt(potId), userId })
      return data({ success: true })
    } catch (error) {
      if (error instanceof Error && error.message === 'Pot not found') {
        return data({ error: 'Pot not found' }, { status: 404 })
      }
      return data({ error: 'Failed to delete pot' }, { status: 500 })
    }
  }

  if (intent === 'add-money' || intent === 'withdraw') {
    const potId = formData.get('potId')
    const amount = formData.get('amount')

    if (typeof potId !== 'string' || typeof amount !== 'string') {
      return data({ error: 'Invalid form data' }, { status: 400 })
    }

    const parsedAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ''))
    if (isNaN(parsedAmount)) {
      return data({ error: 'Invalid amount' }, { status: 400 })
    }

    const finalAmount = Math.abs(parsedAmount)

    try {
      const updatedPot = await updatePotBalance({
        id: parseInt(potId),
        userId,
        amount: intent === 'add-money' ? finalAmount : -finalAmount,
      })
      return data({ success: true, pot: updatedPot })
    } catch (error) {
      console.error('Error updating pot balance:', error)
      return data(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  }

  return data({ error: 'Invalid intent' }, { status: 400 })
}

export default function PotsRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className='w-full mb-12 sm:my-[0px]'>
      <Pots
        pots={loaderData.pots}
        actionData={actionData}
        currentBalance={loaderData.currentBalance}
        budgets={loaderData.budgets}
      />
    </div>
  )
}
