import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { FinancialDataDisplay } from '~/components/FinancialDataDisplay'
import { getFinancialData } from '~/services/finance/finance.service'
import { FinancialData } from '~/types/finance.types'

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const financialData = await getFinancialData()
    return json(financialData)
  } catch (error) {
    console.error('Error loading financial data:', error)
    return json({ error: 'Failed to load financial data' }, { status: 500 })
  }
}

export default function FinancePage() {
  const data = useLoaderData<typeof loader>() as FinancialData

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Banking Dashboard</h1>

      <div className='mb-8'>
        <FinancialDataDisplay data={data} />
      </div>

      <div className='mt-12'>
        <h2 className='text-xl font-semibold mb-4'>Raw JSON Data</h2>
        <pre className='bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto'>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}
