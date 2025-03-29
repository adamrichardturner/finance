import type { MetaFunction } from '@remix-run/node'
import { Link, Form } from '@remix-run/react'
import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getUser } from '~/services/auth/session.server'
import { MonzoService } from '~/services/monzo/monzo.service'

export const meta: MetaFunction = () => {
  return [
    { title: 'Finance App' },
    {
      name: 'description',
      content: 'Track your expenses and manage your finances',
    },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)

  // If user is not authenticated, redirect to login
  if (!user) {
    return redirect('/login')
  }

  // If user is authenticated, redirect to overview
  return redirect('/overview')
}

export default function Index() {
  return (
    <div className='min-h-screen bg-blue-50 flex flex-col justify-center items-center'>
      <div className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg'>
        <h1 className='text-3xl font-bold text-center text-blue-800'>
          Finance App
        </h1>
        <p className='mt-4 text-center text-gray-600'>
          Track your expenses and manage your finances
        </p>
        <div className='mt-8 flex flex-col space-y-4'>
          <Link
            to='/login'
            className='px-4 py-2 bg-blue-600 text-white rounded-md text-center hover:bg-blue-700 transition-colors'
          >
            Login
          </Link>
          <Link
            to='/signup'
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-center hover:bg-gray-300 transition-colors'
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
