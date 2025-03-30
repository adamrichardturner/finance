import { LoaderFunctionArgs } from '@remix-run/node'
import { getUser, requireUserId } from '~/services/auth/session.server'
import { AppLayout } from '~/components/layouts/AppLayout'
import Overview from '~/components/Overview'
import { useFinancialData } from '~/hooks/use-financial-data'
import { AppTransaction } from '~/utils/transform-data'
import { Transaction } from '~/types/finance.types'

// Transform Transaction to AppTransaction
function transformToAppTransaction(transaction: Transaction): AppTransaction {
  return {
    id:
      transaction.id?.toString() || Math.random().toString(36).substring(2, 9),
    date:
      transaction.date instanceof Date
        ? transaction.date.toISOString().split('T')[0]
        : new Date(transaction.date).toISOString().split('T')[0],
    description: transaction.name,
    amount: transaction.amount,
    type: transaction.amount > 0 ? 'income' : 'expense',
    category: transaction.category,
    avatar: transaction.avatar,
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request)

  const user = await getUser(request)

  return { user }
}

export default function OverviewPage() {
  const { financialData, loading, error } = useFinancialData()

  if (loading) {
    return (
      <AppLayout>
        <div className='w-full flex-1 flex items-center justify-center'>
          <p>Loading financial data...</p>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className='w-full flex-1'>
          <p>Error loading financial data: {error.message}</p>
        </div>
      </AppLayout>
    )
  }

  // Transform transactions to AppTransaction format
  const appTransactions = financialData.transactions.map(
    transformToAppTransaction
  )

  return (
    <AppLayout>
      <div className='w-full flex-1'>
        <Overview
          balance={financialData.balance.current}
          income={financialData.balance.income}
          expenses={financialData.balance.expenses}
          pots={financialData.pots}
          budgets={financialData.budgets}
          transactions={appTransactions}
        />
      </div>
    </AppLayout>
  )
}
