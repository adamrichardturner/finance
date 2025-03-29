import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import { createUserSession, getUserId } from '~/services/auth/session.server'
import { getDemoUserEnv } from '~/utils/env.server'
import { Button } from '~/components/ui/button'

type ActionData = {
  fieldErrors?: {
    general?: string
  }
}

// Get demo user ID from environment
const { demoUserId: DEMO_USER_ID } = getDemoUserEnv()

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request)

  if (userId) {
    return redirect('/overview')
  }

  return {}
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const redirectTo = formData.get('redirectTo') || '/overview'

  if (typeof redirectTo !== 'string') {
    return new Response(
      JSON.stringify({
        fieldErrors: {
          general: 'Invalid redirect URL',
        },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Create demo user session - use DEMO_USER_ID directly
    return createUserSession({
      request,
      userId: DEMO_USER_ID,
      remember: true,
      redirectTo,
    })
  } catch (error) {
    console.error('Login error:', error)

    return new Response(
      JSON.stringify({
        fieldErrors: {
          general: 'An unexpected error occurred during login',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export default function Login() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/overview'
  const message = searchParams.get('message')
  const actionData = useActionData<ActionData>()

  return (
    <div className='flex min-h-screen p-[20px]'>
      <div className="hidden md:flex md:w-1/3 flex-col p-8 bg-gray-900 text-white bg-[url('/assets/images/AuthImage.svg')] bg-center bg-cover">
        <div className='flex-shrink-0'>
          <h1 className='text-2xl font-bold'>finance</h1>
        </div>
        <div className='flex-grow flex flex-col items-start justify-end'>
          <div className='max-w-md'>
            <h2 className='text-3xl font-bold mb-4'>
              Keep track of your money and save for your future
            </h2>
            <p className='text-sm text-gray-300'>
              Personal finance app puts you in control of your spending. Track
              transactions, set budgets, and add to savings pots easily.
            </p>
          </div>
        </div>
      </div>

      {/* Right column - Login form */}
      <div className='w-full md:w-[1/2] flex items-center justify-center p-8'>
        <div className='w-full max-w-md bg-white rounded-lg p-8'>
          <div className='text-center mb-10'>
            <h2 className='text-3xl font-bold mb-2'>Login</h2>
            {message && <p className='text-sm text-blue-600 mt-2'>{message}</p>}
          </div>

          {actionData?.fieldErrors?.general && (
            <div className='rounded-md bg-red-50 p-4 mb-6'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-red-400'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-red-800'>
                    {actionData.fieldErrors.general}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <Form method='post'>
            <input type='hidden' name='redirectTo' value={redirectTo} />

            <Button
              type='submit'
              className='w-full py-8 px-4 text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900'
            >
              Try Demo Account
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}
