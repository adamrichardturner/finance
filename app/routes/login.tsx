import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'
import { authenticateUser, loginSchema } from '~/services/auth/auth.service'
import { createUserSession, getUserId } from '~/services/auth/session.server'
import { DEMO_USER_ID } from '~/repositories/user.repository'
import { MonzoService } from '~/services/monzo/monzo.service'

type FieldErrors = {
  email?: string
  password?: string
  general?: string
}

type ActionData = {
  fieldErrors?: FieldErrors
  fields?: {
    email: string
    remember: boolean
  }
  monzoAuthUrl?: string
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request)

  if (userId) {
    return redirect('/overview')
  }

  // Generate Monzo auth URL
  const monzoService = new MonzoService()
  const stateValue = Math.random().toString(36).substring(2, 15)
  const monzoAuthUrl = monzoService.getAuthorizationUrl(stateValue)

  return { monzoAuthUrl }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const remember = formData.get('remember') === 'on'
  const redirectTo = formData.get('redirectTo') || '/overview'
  const demoLogin = formData.get('demo-login') === 'true'

  // Handle demo login request
  if (demoLogin) {
    return createUserSession({
      request,
      userId: DEMO_USER_ID,
      remember: true,
      redirectTo: redirectTo.toString(),
    })
  }

  if (
    !email ||
    !password ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof redirectTo !== 'string'
  ) {
    return new Response(
      JSON.stringify({
        fieldErrors: {
          general: 'Form submitted incorrectly',
        },
        fields: {
          email: typeof email === 'string' ? email : '',
          remember,
        },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const formValidation = loginSchema.safeParse({
    email,
    password,
    remember,
  })

  if (!formValidation.success) {
    const fieldErrors: FieldErrors = {}

    formValidation.error.errors.forEach((error) => {
      if (error.path) {
        const fieldName = error.path[0]
        fieldErrors[fieldName as keyof FieldErrors] = error.message
      }
    })

    return new Response(
      JSON.stringify({
        fieldErrors,
        fields: {
          email,
          remember,
        },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const result = await authenticateUser({ email, password, remember })

    if (!result.userId) {
      return new Response(
        JSON.stringify({
          fieldErrors: {
            general: result.error || 'Invalid login',
          },
          fields: {
            email,
            remember,
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // User successfully logged in, create session
    return createUserSession({
      request,
      userId: result.userId,
      remember,
      redirectTo,
    })
  } catch (error) {
    console.error('Login error:', error)

    return new Response(
      JSON.stringify({
        fieldErrors: {
          general: 'An unexpected error occurred during login',
        },
        fields: {
          email,
          remember,
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export default function Login() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/overview'
  const actionData = useActionData<ActionData>()

  return (
    <div className='min-h-screen flex bg-gray-100'>
      {/* Left Column - Illustration and marketing copy */}
      <div className='hidden lg:flex lg:w-1/2 bg-gray-900 text-white p-12 flex-col justify-center'>
        <div className='max-w-md mx-auto'>
          <h1 className='text-4xl font-bold mb-6'>
            Keep track of your money and save for your future
          </h1>
          <p className='text-lg text-gray-300 mb-8'>
            Personal finance app helps you in control of your spending. Track
            transactions, set budgets, and add to savings goals easily.
          </p>
          <img
            src='/assets/images/finance-illustration.svg'
            alt='Finance illustration'
            className='w-full max-w-sm mx-auto'
          />
        </div>
      </div>

      {/* Right Column - Login form */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
        <div className='w-full max-w-md'>
          <div className='bg-white rounded-lg shadow-lg p-8'>
            <h2 className='text-2xl font-bold text-center text-gray-800 mb-8'>
              Login
            </h2>

            {actionData?.fieldErrors?.general && (
              <div className='rounded-md bg-red-50 p-4 mb-6'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-5 w-5 text-red-400'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                      fill='currentColor'
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

            <Form method='post' className='space-y-6'>
              <input type='hidden' name='redirectTo' value={redirectTo} />

              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700'
                >
                  Email
                </label>
                <div className='mt-1'>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    defaultValue={actionData?.fields?.email || ''}
                    required
                    className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                  {actionData?.fieldErrors?.email && (
                    <p className='mt-1 text-sm text-red-600'>
                      {actionData.fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700'
                >
                  Password
                </label>
                <div className='mt-1 relative'>
                  <input
                    id='password'
                    name='password'
                    type='password'
                    autoComplete='current-password'
                    required
                    className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                  {actionData?.fieldErrors?.password && (
                    <p className='mt-1 text-sm text-red-600'>
                      {actionData.fieldErrors.password}
                    </p>
                  )}
                  {/* Password visibility toggle could be added here */}
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <input
                    id='remember'
                    name='remember'
                    type='checkbox'
                    defaultChecked={actionData?.fields?.remember}
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  />
                  <label
                    htmlFor='remember'
                    className='ml-2 block text-sm text-gray-700'
                  >
                    Remember me
                  </label>
                </div>

                <div className='text-sm'>
                  <Link
                    to='/forgot-password'
                    className='font-medium text-blue-600 hover:text-blue-500'
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type='submit'
                  className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                >
                  Login
                </button>
              </div>
            </Form>

            <div className='mt-6'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-white text-gray-500'>
                    Or continue with
                  </span>
                </div>
              </div>

              <div className='mt-6 grid grid-cols-1 gap-3'>
                <a
                  href='/monzo-auth'
                  className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#fa4d30] hover:bg-[#e64428] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fa4d30]'
                >
                  Connect with Monzo
                </a>

                <Form method='post'>
                  <input type='hidden' name='demo-login' value='true' />
                  <button
                    type='submit'
                    className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                  >
                    Login as Demo User
                  </button>
                </Form>
              </div>
            </div>

            <div className='mt-6 text-center'>
              <p className='text-sm text-gray-600'>
                Need to create an account?{' '}
                <Link
                  to='/register'
                  className='font-medium text-blue-600 hover:text-blue-500'
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
