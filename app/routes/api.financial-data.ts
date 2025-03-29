import { LoaderFunctionArgs } from '@remix-run/node'
import { getUserId } from '~/services/auth/session.server'
import db from '~/lib/db.server'

// Define a transformation function directly in this file to avoid import issues
const transformDbTransaction = (transaction: any) => {
  return {
    id:
      transaction.id?.toString() || Math.random().toString(36).substring(2, 9),
    date: new Date(transaction.date).toISOString().slice(0, 10),
    description: transaction.name,
    amount: transaction.amount,
    type: transaction.amount > 0 ? 'income' : 'expense',
    category: transaction.category,
    avatar: transaction.avatar,
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure the user is authenticated
  const userId = await getUserId(request)

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('user id is: ', userId)

  try {
    console.log('GETTING BALANCE')
    // Get balance data from database
    const balance = await db('balance').where({ user_id: userId }).first()

    console.log('BALANCEI S: ', balance)

    // Get transactions with pagination
    const transactions = await db('transactions')
      .where({ user_id: userId })
      .orderBy('date', 'desc')
      .limit(30)

    // Get budgets
    const budgets = await db('budgets').where({ user_id: userId })

    // Get pots
    const pots = await db('pots').where({ user_id: userId })

    // Transform the transactions to the expected format
    const transformedTransactions = (transactions || []).map(
      transformDbTransaction
    )

    return Response.json({
      balance: balance?.current || 0,
      income: balance?.income || 0,
      expenses: balance?.expenses || 0,
      transactions: transformedTransactions,
      budgets: budgets || [],
      pots: pots || [],
    })
  } catch (error) {
    console.error('Error fetching financial data:', error)

    // Return a proper error response instead of falling back to demo data
    return Response.json(
      { error: 'Failed to load financial data. Please try again later.' },
      { status: 500 }
    )
  }
}
