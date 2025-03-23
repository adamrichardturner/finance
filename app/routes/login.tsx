import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'
import { authenticateUser, loginSchema } from '~/services/auth/auth.service'
import { createUserSession, getUserId } from '~/services/auth/session.server'
import { DEMO_USER_ID } from '~/repositories/user.repository'

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
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request)

  if (userId) {
    return redirect('/dashboard')
  }

  return {}
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const remember = formData.get('remember') === 'on'
  const redirectTo = formData.get('redirectTo') || '/dashboard'
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
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const actionData = useActionData<ActionData>()

  return (
    <div className='flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white'>
          Sign in to your account
        </h2>
        <p className='mt-2 text-center text-sm text-gray-600 dark:text-gray-400'>
          Or{' '}
          <Link
            to='/register'
            className='font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800'>
          {actionData?.fieldErrors?.general && (
            <div className='rounded-md bg-red-50 p-4 mb-6 dark:bg-red-900/30'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-red-400 dark:text-red-500'
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
                  <h3 className='text-sm font-medium text-red-800 dark:text-red-200'>
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
                className='block text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Email address
              </label>
              <div className='mt-1'>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  defaultValue={actionData?.fields?.email || ''}
                  required
                  className='block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                />
                {actionData?.fieldErrors?.email && (
                  <p className='mt-2 text-sm text-red-600 dark:text-red-400'>
                    {actionData.fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Password
              </label>
              <div className='mt-1'>
                <input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  required
                  className='block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                />
                {actionData?.fieldErrors?.password && (
                  <p className='mt-2 text-sm text-red-600 dark:text-red-400'>
                    {actionData.fieldErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <input
                  id='remember'
                  name='remember'
                  type='checkbox'
                  defaultChecked={actionData?.fields?.remember}
                  className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700'
                />
                <label
                  htmlFor='remember'
                  className='ml-2 block text-sm text-gray-900 dark:text-gray-300'
                >
                  Remember me
                </label>
              </div>

              <div className='text-sm'>
                <Link
                  to='/forgot-password'
                  className='font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type='submit'
                className='flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800'
              >
                Sign in
              </button>
            </div>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300 dark:border-gray-600'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400'>
                  Or
                </span>
              </div>
            </div>

            <div>
              <button
                type='submit'
                name='demo-login'
                value='true'
                className='flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              >
                Try Demo Account
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
