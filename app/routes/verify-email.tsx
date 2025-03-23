import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { getUserId } from '~/services/auth/session.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request)

  if (!userId) {
    return redirect('/login')
  }

  return {}
}

export default function VerifyEmailPage() {
  useLoaderData<typeof loader>()

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white'>
            Check your email
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600 dark:text-gray-400'>
            We've sent a verification email to your inbox
          </p>
        </div>

        <div className='rounded-md bg-blue-50 p-4 dark:bg-blue-900/30'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-blue-400 dark:text-blue-300'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3 flex-1 md:flex md:justify-between'>
              <p className='text-sm text-blue-700 dark:text-blue-200'>
                Please click the link in the email we just sent you to verify
                your account.
              </p>
            </div>
          </div>
        </div>

        <div className='flex flex-col space-y-4'>
          <button
            type='button'
            className='w-full rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800'
          >
            Resend verification email
          </button>

          <Link
            to='/login'
            className='w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            Return to login
          </Link>
        </div>
      </div>
    </div>
  )
}
