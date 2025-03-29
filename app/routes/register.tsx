import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { Form, Link, useActionData } from '@remix-run/react'
import { z } from 'zod'
import { createUserSession, getUserId } from '~/services/auth/session.server'
import { register, registerSchema } from '~/services/auth/auth.service'

type FieldErrors = {
  email?: string
  password?: string
  confirmPassword?: string
  full_name?: string
  general?: string
}

type ActionData = {
  fieldErrors?: FieldErrors
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request)

  if (userId) {
    return redirect('/overview')
  }

  return {}
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')
  const full_name = formData.get('full_name')

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof confirmPassword !== 'string' ||
    typeof full_name !== 'string'
  ) {
    return new Response(
      JSON.stringify({
        fieldErrors: {
          general: 'Form submitted incorrectly',
        },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const formValidation = registerSchema.safeParse({
    email,
    password,
    confirmPassword,
    full_name,
  })

  if (!formValidation.success) {
    const fieldErrors: FieldErrors = {}

    formValidation.error.errors.forEach((error) => {
      if (error.path) {
        const fieldName = error.path[0]
        fieldErrors[fieldName as keyof FieldErrors] = error.message
      }
    })

    return new Response(JSON.stringify({ fieldErrors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const result = await register({
      email,
      password,
      confirmPassword,
      full_name,
    })

    if (!result.user) {
      return new Response(
        JSON.stringify({
          fieldErrors: {
            general:
              result.error ||
              'Something went wrong trying to create a new user.',
          },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return redirect('/verify-email')
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          fieldErrors: {
            general: error.message,
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        fieldErrors: {
          general: 'Something went wrong trying to create a new user.',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export default function Register() {
  const actionData = useActionData<ActionData>()
  const fieldErrors = actionData?.fieldErrors || {}

  return (
    <div className='flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white'>
          Create a new account
        </h2>
        <p className='mt-2 text-center text-sm text-gray-600 dark:text-gray-400'>
          Or{' '}
          <Link
            to='/login'
            className='font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800'>
          {fieldErrors.general && (
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
                    {fieldErrors.general}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <Form method='post' className='space-y-6'>
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
                  required
                  className='block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                />
                {fieldErrors.email && (
                  <p
                    className='mt-2 text-sm text-red-600 dark:text-red-400'
                    id='email-error'
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor='full_name'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Full Name
              </label>
              <div className='mt-1'>
                <input
                  id='full_name'
                  name='full_name'
                  type='text'
                  autoComplete='name'
                  required
                  className='block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                />
                {fieldErrors.full_name && (
                  <p
                    className='mt-2 text-sm text-red-600 dark:text-red-400'
                    id='name-error'
                  >
                    {fieldErrors.full_name}
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
                  autoComplete='new-password'
                  required
                  className='block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                />
                {fieldErrors.password && (
                  <p
                    className='mt-2 text-sm text-red-600 dark:text-red-400'
                    id='password-error'
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Confirm Password
              </label>
              <div className='mt-1'>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type='password'
                  autoComplete='new-password'
                  required
                  className='block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                />
                {fieldErrors.confirmPassword && (
                  <p
                    className='mt-2 text-sm text-red-600 dark:text-red-400'
                    id='confirm-password-error'
                  >
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type='submit'
                className='flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800'
              >
                Sign up
              </button>
            </div>
          </Form>

          <div className='mt-6'>
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

            <Form method='post' action='/login' className='mt-6'>
              <input type='hidden' name='demo-login' value='true' />
              <button
                type='submit'
                className='flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              >
                Try Demo Account
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
