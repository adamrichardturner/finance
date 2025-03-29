import { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getUser, requireUserId } from '~/services/auth/session.server'
import { AppLayout } from '~/components/layouts/AppLayout'
import Overview from '~/components/Overview'
import { useFinancialData } from '~/hooks/use-financial-data'

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request)

  const user = await getUser(request)

  return { user }
}

export default function DashboardPage() {
  const { user } = useLoaderData<typeof loader>()
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

  return (
    <AppLayout>
      <div className='w-full flex-1'>
        <Overview
          balance={financialData.balance}
          income={financialData.income}
          expenses={financialData.expenses}
        />
      </div>
    </AppLayout>
  )
}
