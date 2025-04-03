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
} from '~/services/finance/finance.service'
import { useEffect } from 'react'
import db from '~/lib/db.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'Pots | Finance App' },
    { name: 'description', content: 'Manage your savings pots' },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  try {
    // Ensure userId is a string
    const pots = await getPots(userId.toString())
    return data({ pots })
  } catch (error) {
    console.error('Error fetching pots:', error)
    return data({ pots: [], error: 'Failed to fetch pots' }, { status: 500 })
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

    console.log('Raw amount from form:', amount, typeof amount)

    if (typeof potId !== 'string' || typeof amount !== 'string') {
      return data({ error: 'Invalid form data' }, { status: 400 })
    }

    // Ensure we parse the amount correctly as a number
    const parsedAmount = Number(amount)
    console.log('Parsed amount:', parsedAmount, typeof parsedAmount)

    // For withdrawals, convert the amount to negative
    const finalAmount =
      intent === 'withdraw' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount)
    console.log('Final amount:', finalAmount, typeof finalAmount)

    try {
      // For adding money, check if there's enough in the main account
      if (intent === 'add-money') {
        // Get the current balance
        const balance = await db('balance').where('user_id', userId).first()

        console.log(
          'Current balance:',
          balance?.current,
          typeof balance?.current
        )

        // Ensure balance.current is a number
        const currentBalance = Number(balance?.current || 0)

        if (!balance || currentBalance < parsedAmount) {
          return data(
            {
              error: `Not enough funds in your main account. Available: £${currentBalance.toFixed(2)}`,
            },
            { status: 400 }
          )
        }
      }

      console.log('Updating pot balance:', {
        id: parseInt(potId),
        userId,
        amount: finalAmount,
      })
      const pot = await updatePotBalance({
        id: parseInt(potId),
        userId,
        amount: finalAmount,
      })
      console.log('Updated pot:', pot)
      return data({ success: true, pot })
    } catch (error) {
      console.error('Error updating pot balance:', error)
      if (error instanceof Error && error.message === 'Pot not found') {
        return data({ error: 'Pot not found' }, { status: 404 })
      } else if (
        error instanceof Error &&
        error.message.includes('Cannot withdraw')
      ) {
        return data({ error: error.message }, { status: 400 })
      }
      return data(
        {
          error: `Failed to ${intent === 'add-money' ? 'add money to' : 'withdraw from'} pot`,
        },
        { status: 500 }
      )
    }
  }

  return data({ error: 'Invalid intent' }, { status: 400 })
}

export default function PotsRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const revalidator = useRevalidator()

  // Revalidate data when action is successful
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success === true) {
      // Revalidate the data to refresh the UI with the latest changes
      revalidator.revalidate()
    }
  }, [actionData, revalidator])

  return (
    <div className='w-full mb-12 sm:my-[0px]'>
      <Pots pots={loaderData.pots} actionData={actionData} />
    </div>
  )
}
