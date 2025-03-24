import { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { getUser, requireUserId } from '~/services/auth/session.server'
import { AppLayout } from '~/components/layouts/AppLayout'

export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure the user is authenticated
  await requireUserId(request)

  // Get the authenticated user
  const user = await getUser(request)
  const isDemoUser = user?.id === 'demo-user-id'

  return { user, isDemoUser }
}

export default function DashboardPage() {
  const { user, isDemoUser } = useLoaderData<typeof loader>()

  // Log to confirm the component is rendering
  console.log('Rendering Dashboard page with AppLayout')

  return (
    <AppLayout>
      <div className='bg-white shadow dark:bg-gray-800'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
              Dashboard
            </h1>
            {isDemoUser && (
              <span className='inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
                Demo Account
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-7xl py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <div className='rounded-lg border-4 border-dashed border-gray-200 p-6 dark:border-gray-700'>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <div className='bg-white p-6 rounded-lg shadow dark:bg-gray-800'>
                <h2 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
                  Account Information
                </h2>
                <div className='space-y-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Full Name
                    </p>
                    <p className='text-lg text-gray-900 dark:text-white'>
                      {user?.full_name}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Email
                    </p>
                    <p className='text-lg text-gray-900 dark:text-white'>
                      {user?.email}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Email Verification
                    </p>
                    <div className='flex items-center mt-1'>
                      {user?.email_verified ? (
                        <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300'>
                          Verified
                        </span>
                      ) : (
                        <span className='inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300'>
                          Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className='mt-6'>
                  <Link
                    to='/settings/profile'
                    className='inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600'
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>

              <div className='bg-white p-6 rounded-lg shadow dark:bg-gray-800'>
                <h2 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
                  Financial Overview
                </h2>
                <div className='space-y-8'>
                  <div>
                    <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Current Balance
                    </p>
                    <p className='text-3xl font-bold text-gray-900 dark:text-white'>
                      $4,836.92
                    </p>
                  </div>
                  <div>
                    <div className='flex justify-between items-center mb-1'>
                      <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                        Monthly Budget
                      </p>
                      <p className='text-sm font-medium text-green-600 dark:text-green-400'>
                        68% remaining
                      </p>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
                      <div
                        className='bg-green-600 h-2.5 rounded-full dark:bg-green-500'
                        style={{ width: '68%' }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className='mt-6'>
                  <Link
                    to='/finance'
                    className='inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600'
                  >
                    View Financial Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className='mt-6'>
              <h2 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
                Quick Links
              </h2>
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                <Link
                  to='/finance'
                  className='flex flex-col items-center p-4 bg-white rounded-lg shadow dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  <span className='text-blue-600 dark:text-blue-400 text-2xl'>
                    💰
                  </span>
                  <span className='mt-2 text-sm font-medium text-gray-900 dark:text-white'>
                    Finances
                  </span>
                </Link>

                <Link
                  to='/settings/profile'
                  className='flex flex-col items-center p-4 bg-white rounded-lg shadow dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  <span className='text-gray-600 dark:text-gray-400 text-2xl'>
                    ⚙️
                  </span>
                  <span className='mt-2 text-sm font-medium text-gray-900 dark:text-white'>
                    Settings
                  </span>
                </Link>

                <Link
                  to='#'
                  className='flex flex-col items-center p-4 bg-white rounded-lg shadow dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  <span className='text-purple-600 dark:text-purple-400 text-2xl'>
                    📊
                  </span>
                  <span className='mt-2 text-sm font-medium text-gray-900 dark:text-white'>
                    Reports
                  </span>
                </Link>

                <Link
                  to='#'
                  className='flex flex-col items-center p-4 bg-white rounded-lg shadow dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  <span className='text-orange-600 dark:text-orange-400 text-2xl'>
                    🔔
                  </span>
                  <span className='mt-2 text-sm font-medium text-gray-900 dark:text-white'>
                    Notifications
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
