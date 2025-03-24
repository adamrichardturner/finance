import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { useState } from 'react'
import {
  getUser,
  requireUserId,
  updateUserProfile,
} from '~/services/auth/session.server'
import { User } from '~/types/auth.types'
import { AppLayout } from '~/components/layouts/AppLayout'

interface ErrorResponse {
  errors: {
    full_name?: string
    general?: string
  }
}

interface SuccessResponse {
  success: boolean
}

type ActionData = ErrorResponse | SuccessResponse

// Type guard functions to check the type of actionData
function isSuccessResponse(
  data: ActionData | undefined
): data is SuccessResponse {
  return data !== undefined && 'success' in data
}

function isErrorResponse(data: ActionData | undefined): data is ErrorResponse {
  return data !== undefined && 'errors' in data
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request)
  const user = await getUser(request)

  if (!user) {
    return redirect('/login')
  }

  return { user }
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()

  const full_name = formData.get('full_name')

  if (typeof full_name !== 'string' || full_name.length < 3) {
    return new Response(
      JSON.stringify({
        errors: { full_name: 'Full name must be at least 3 characters long' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    await updateUserProfile(userId, { full_name })
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        errors: { general: 'Failed to update profile. Please try again.' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export default function ProfileSettings() {
  const { user } = useLoaderData<typeof loader>()
  const actionData = useActionData<ActionData>()
  const [formData, setFormData] = useState({
    full_name: user.full_name,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  return (
    <AppLayout>
      <div className='bg-white shadow dark:bg-gray-800'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
            Profile Settings
          </h1>
        </div>
      </div>

      <div className='mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8'>
        <div className='bg-white shadow sm:rounded-lg dark:bg-gray-800'>
          <div className='px-4 py-5 sm:p-6'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-white'>
              Profile Settings
            </h3>
            <div className='mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400'>
              <p>Update your personal information.</p>
            </div>

            {isSuccessResponse(actionData) && actionData.success && (
              <div className='mt-4 rounded-md bg-green-50 p-4 dark:bg-green-900'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-5 w-5 text-green-400 dark:text-green-300'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      aria-hidden='true'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-green-800 dark:text-green-200'>
                      Profile updated successfully!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Form method='post' className='mt-5 space-y-6'>
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
                    required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                  />
                </div>
                {isErrorResponse(actionData) && actionData.errors.full_name && (
                  <p className='mt-2 text-sm text-red-600 dark:text-red-400'>
                    {actionData.errors.full_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Email (cannot be changed)
                </label>
                <div className='mt-1'>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    disabled
                    value={user.email}
                    className='block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-600'
                  />
                </div>
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  className='inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800'
                >
                  Save Changes
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
