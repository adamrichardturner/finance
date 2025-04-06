import {
  type MetaFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
  data,
} from '@remix-run/node'
import { Pots } from '~/components/Pots'
import { requireUserId } from '~/services/auth/session.server'
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react'
import {
  getPots,
  createPot,
  updatePot,
  deletePot,
  updatePotBalance,
} from '~/services/finance/finance.service'
import { getBudgets } from '~/models/budget.server'
import { getFinancialData } from '~/services/finance/finance.service'
import { formatCurrency } from '~/utils/number-formatter'
import { useTransactions } from '~/hooks/use-transactions'
import { useEffect } from 'react'
import { Budget, Pot } from '~/types/finance.types'

// Maximum PostgreSQL numeric value for pot precision 10, scale 2
const MAX_POT_AMOUNT = 99999999.99

export const meta: MetaFunction = () => {
  return [
    { title: 'Savings Pots | Finance App' },
    { name: 'description', content: 'Manage your savings pots' },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = String(await requireUserId(request))

  try {
    const pots = await getPots(userId)
    const budgets = await getBudgets(userId)
    const financialData = await getFinancialData()
    const currentBalance = financialData.balance?.current || 0

    return data({
      pots,
      currentBalance,
      budgets,
    })
  } catch (error) {
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

  // Get current balance to validate operations
  const financialData = await getFinancialData()
  const currentBalance = financialData.balance?.current || 0

  if (intent === 'create') {
    const name = formData.get('name')
    const target = formData.get('target')
    const theme = formData.get('theme')
    const initialAmount = formData.get('initialAmount')

    if (
      typeof name !== 'string' ||
      typeof target !== 'string' ||
      typeof theme !== 'string'
    ) {
      return data(
        { error: 'Invalid form data', success: false },
        { status: 400 }
      )
    }

    // Parse target amount
    const targetAmount = parseFloat(target)

    // Parse initial amount if provided
    let initialAmountValue = 0
    if (initialAmount && typeof initialAmount === 'string') {
      initialAmountValue = parseFloat(initialAmount)

      // Validate if initial amount is valid
      if (isNaN(initialAmountValue) || initialAmountValue < 0) {
        return data(
          { error: 'Invalid initial amount', success: false },
          { status: 400 }
        )
      }

      // Validate against current balance
      if (initialAmountValue > currentBalance) {
        return data(
          {
            error: `Cannot add more than your available balance of ${formatCurrency(currentBalance)}`,
            success: false,
          },
          { status: 400 }
        )
      }
    }

    // Validate against PostgreSQL numeric limit
    if (targetAmount > MAX_POT_AMOUNT) {
      return data(
        {
          error: `Target amount cannot exceed ${formatCurrency(MAX_POT_AMOUNT)}`,
          success: false,
        },
        { status: 400 }
      )
    }

    // Check if color is already in use by another pot
    const existingPots = await getPots(userId)
    const colorAlreadyInUse = existingPots.some((pot) => pot.theme === theme)

    if (colorAlreadyInUse) {
      return data(
        {
          error:
            'This color is already in use by another pot. Please select a different color.',
          success: false,
        },
        { status: 400 }
      )
    }

    try {
      const pot = await createPot({
        userId,
        name,
        target: targetAmount,
        theme,
        initialAmount: initialAmountValue > 0 ? initialAmountValue : undefined,
      })
      return data({ success: true, pot })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return data({ error: error.message, success: false }, { status: 400 })
      }
      return data(
        { error: 'Failed to create pot', success: false },
        { status: 500 }
      )
    }
  }

  if (intent === 'update') {
    const potId = formData.get('potId')
    const name = formData.get('name')
    const target = formData.get('target')
    const theme = formData.get('theme')
    const addFunds = formData.get('addFunds')

    if (
      typeof potId !== 'string' ||
      typeof name !== 'string' ||
      typeof target !== 'string' ||
      typeof theme !== 'string'
    ) {
      return data(
        { error: 'Invalid form data', success: false },
        { status: 400 }
      )
    }

    // Parse target amount
    const targetAmount = parseFloat(target)
    const potIdValue = parseInt(potId)

    // Validate against PostgreSQL numeric limit
    if (targetAmount > MAX_POT_AMOUNT) {
      return data(
        {
          error: `Target amount cannot exceed ${formatCurrency(MAX_POT_AMOUNT)}`,
          success: false,
        },
        { status: 400 }
      )
    }

    // Check if color is already in use by another pot
    const existingPots = await getPots(userId)
    const colorAlreadyInUse = existingPots.some(
      (pot) => pot.theme === theme && String(pot.id) !== potId
    )

    if (colorAlreadyInUse) {
      return data(
        {
          error:
            'This color is already in use by another pot. Please select a different color.',
          success: false,
        },
        { status: 400 }
      )
    }

    try {
      let pot = await updatePot({
        id: potIdValue,
        userId,
        name,
        target: targetAmount,
        theme,
      })

      // Handle adding funds if provided
      if (addFunds && typeof addFunds === 'string') {
        const amount = parseFloat(addFunds)
        if (!isNaN(amount) && amount > 0) {
          // Validate against current balance
          if (amount > currentBalance) {
            return data(
              {
                error: `Cannot add more than your available balance of ${formatCurrency(currentBalance)}`,
                success: false,
              },
              { status: 400 }
            )
          }

          pot = await updatePotBalance({
            id: potIdValue,
            userId,
            amount: amount,
          })
        }
      }

      return data({ success: true, pot })
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return data({ error: error.message, success: false }, { status: 400 })
      } else if (error instanceof Error && error.message === 'Pot not found') {
        return data({ error: 'Pot not found', success: false }, { status: 404 })
      }
      return data(
        { error: 'Failed to update pot', success: false },
        { status: 500 }
      )
    }
  }

  if (intent === 'delete') {
    const potId = formData.get('potId')

    if (typeof potId !== 'string') {
      return data({ error: 'Invalid pot ID', success: false }, { status: 400 })
    }

    try {
      await deletePot({ id: parseInt(potId), userId })
      return data({ success: true })
    } catch (error) {
      if (error instanceof Error && error.message === 'Pot not found') {
        return data({ error: 'Pot not found', success: false }, { status: 404 })
      }
      return data(
        { error: 'Failed to delete pot', success: false },
        { status: 500 }
      )
    }
  }

  if (intent === 'add-money' || intent === 'withdraw') {
    const potId = formData.get('potId')
    const amount = formData.get('amount')

    if (typeof potId !== 'string' || typeof amount !== 'string') {
      return data(
        { error: 'Invalid form data', success: false },
        { status: 400 }
      )
    }

    const parsedAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ''))
    if (isNaN(parsedAmount)) {
      return data({ error: 'Invalid amount', success: false }, { status: 400 })
    }

    const finalAmount = Math.abs(parsedAmount)

    // Validate amount limits
    if (finalAmount > MAX_POT_AMOUNT) {
      return data(
        {
          error: `Amount cannot exceed ${formatCurrency(MAX_POT_AMOUNT)}`,
          success: false,
        },
        { status: 400 }
      )
    }

    // Validate against current balance for add-money
    if (intent === 'add-money' && finalAmount > currentBalance) {
      return data(
        {
          error: `Cannot add more than your available balance of ${formatCurrency(currentBalance)}`,
          success: false,
        },
        { status: 400 }
      )
    }

    try {
      const updatedPot = await updatePotBalance({
        id: parseInt(potId),
        userId,
        amount: intent === 'add-money' ? finalAmount : -finalAmount,
      })
      return data({ success: true, pot: updatedPot })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      return data({ error: errorMessage, success: false }, { status: 500 })
    }
  }

  return data({ error: 'Invalid intent', success: false }, { status: 400 })
}

export default function PotsRoute() {
  const { pots, currentBalance, budgets } = useLoaderData<{
    pots: Pot[]
    currentBalance: number
    budgets: Budget[]
  }>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const { refreshTransactions } = useTransactions()

  // Refresh transactions when actionData changes (pot operations completed)
  useEffect(() => {
    if (actionData?.success) {
      // If a pot action was successful, refresh the transactions
      // Short delay to ensure the DB operation completes
      const timer = setTimeout(() => {
        refreshTransactions().catch((error) => {
          console.error('Failed to refresh transactions:', error)
        })
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [actionData, refreshTransactions])

  return (
    <div className='w-full mb-12 sm:my-[0px]'>
      <Pots
        pots={pots}
        actionData={actionData}
        currentBalance={currentBalance}
        budgets={budgets}
      />
    </div>
  )
}
