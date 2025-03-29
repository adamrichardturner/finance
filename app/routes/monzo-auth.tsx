import {
  LoaderFunctionArgs,
  json,
  redirect,
  ActionFunctionArgs,
} from '@remix-run/node'
import { Form, useLoaderData, useActionData } from '@remix-run/react'
import { getUser, requireUserId } from '~/services/auth/session.server'
// Direct server import - this file only runs on the server
import { createMonzoService } from '~/services/monzo/monzo.server'

// Generate a random state for OAuth
function generateState(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure the user is authenticated to access this route
  await requireUserId(request)

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const storedState = url.searchParams.get('stored_state')

  // If we have a code and state, handle the callback from Monzo
  if (code && state && storedState && state === storedState) {
    try {
      const monzoService = createMonzoService()

      // Exchange the authorization code for an access token
      const tokenData = await monzoService.exchangeCodeForToken(code)

      // Create a session for the user with the token
      const sessionCookie = await monzoService.createUserSession(tokenData)

      // Redirect to the dashboard with the session cookie
      return redirect('/overview', {
        headers: {
          'Set-Cookie': sessionCookie,
        },
      })
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      return json({
        error: 'Failed to authenticate with Monzo. Please try again.',
      })
    }
  }

  // If we don't have a code and state, show the connect button
  return json({
    error: null,
    authUrl: null,
  })
}

export async function action({ request }: ActionFunctionArgs) {
  // Ensure the user is authenticated to access this route
  await requireUserId(request)

  // Generate a state for OAuth
  const state = generateState()

  // Get the authorization URL from Monzo
  const monzoService = createMonzoService()
  const authUrl = monzoService.getAuthorizationUrl(state)

  // Add the state as a query param to the auth URL to verify later
  const authUrlWithState = `${authUrl}&stored_state=${state}`

  return json({ authUrl: authUrlWithState })
}

export default function MonzoAuth() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  // Use the authUrl from actionData if available, otherwise from loaderData
  const authUrl = actionData?.authUrl || null

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
          <div className='text-center mb-6'>
            <h2 className='text-3xl font-extrabold text-gray-900'>
              Connect to Monzo
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              Connect your Monzo account to track your transactions and manage
              your finances.
            </p>
          </div>

          {loaderData?.error && (
            <div className='bg-red-50 border-l-4 border-red-400 p-4 mb-6'>
              <div className='flex'>
                <div className='ml-3'>
                  <p className='text-sm text-red-700'>{loaderData.error}</p>
                </div>
              </div>
            </div>
          )}

          {authUrl ? (
            <div className='text-center'>
              <a
                href={authUrl}
                className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                Connect with Monzo
              </a>
            </div>
          ) : (
            <Form method='post'>
              <div className='text-center'>
                <button
                  type='submit'
                  className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  Connect with Monzo
                </button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  )
}
