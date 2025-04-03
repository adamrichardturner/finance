import type { MetaFunction } from '@remix-run/node'
import { Link, Form } from '@remix-run/react'
import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getUserId } from '~/services/auth/session.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'Banking App' },
    { name: 'description', content: 'Finance and Banking Dashboard' },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request)

  if (userId) {
    return redirect('/overview')
  }

  return redirect('/login')
}

export default function Index() {
  return (
    <div className='bg-white dark:bg-gray-900'>
      <div className='relative isolate px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl py-32 sm:py-48 lg:py-56'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl'>
              Take control of your finances with FinanceApp
            </h1>
            <p className='mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300'>
              Track expenses, set budgets, and achieve your financial goals with
              our simple, intuitive finance management application. Start your
              journey towards financial freedom today.
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <Link
                to='/register'
                className='rounded-md bg-blue-600 px-5 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600'
              >
                Get started
              </Link>
              <Form method='post' action='/login'>
                <input type='hidden' name='demo-login' value='true' />
                <button
                  type='submit'
                  className='rounded-md bg-gray-50 px-5 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700'
                >
                  Try Demo
                </button>
              </Form>
              <Link
                to='/login'
                className='text-base font-semibold leading-7 text-gray-900 dark:text-white hover:underline'
              >
                Sign in <span aria-hidden='true'>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className='bg-gray-50 py-24 sm:py-32 dark:bg-gray-800'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl lg:text-center'>
            <h2 className='text-base font-semibold leading-7 text-blue-600 dark:text-blue-400'>
              Manage Better
            </h2>
            <p className='mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl'>
              Everything you need to track your finances
            </p>
            <p className='mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300'>
              Our comprehensive suite of tools helps you stay on top of your
              financial health with minimal effort and maximum insight.
            </p>
          </div>
          <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl'>
            <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16'>
              <div className='relative pl-16'>
                <dt className='text-base font-semibold leading-7 text-gray-900 dark:text-white'>
                  <div className='absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-700'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='w-6 h-6 text-white'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z'
                      />
                    </svg>
                  </div>
                  Expense Tracking
                </dt>
                <dd className='mt-2 text-base leading-7 text-gray-600 dark:text-gray-300'>
                  Easily log and categorize your expenses to understand where
                  your money is going.
                </dd>
              </div>
              <div className='relative pl-16'>
                <dt className='text-base font-semibold leading-7 text-gray-900 dark:text-white'>
                  <div className='absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-700'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='w-6 h-6 text-white'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                      />
                    </svg>
                  </div>
                  Budget Management
                </dt>
                <dd className='mt-2 text-base leading-7 text-gray-600 dark:text-gray-300'>
                  Create and manage budgets for different expense categories to
                  stay on track with your financial goals.
                </dd>
              </div>
              <div className='relative pl-16'>
                <dt className='text-base font-semibold leading-7 text-gray-900 dark:text-white'>
                  <div className='absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-700'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='w-6 h-6 text-white'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605'
                      />
                    </svg>
                  </div>
                  Visual Analytics
                </dt>
                <dd className='mt-2 text-base leading-7 text-gray-600 dark:text-gray-300'>
                  See your financial data visualized through intuitive charts
                  and graphs for better insights.
                </dd>
              </div>
              <div className='relative pl-16'>
                <dt className='text-base font-semibold leading-7 text-gray-900 dark:text-white'>
                  <div className='absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-700'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='w-6 h-6 text-white'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z'
                      />
                    </svg>
                  </div>
                  Goal Setting
                </dt>
                <dd className='mt-2 text-base leading-7 text-gray-600 dark:text-gray-300'>
                  Set financial goals and track your progress toward achieving
                  them.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
