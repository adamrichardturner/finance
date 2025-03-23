import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { logout } from '~/services/auth/session.server'

// Handle the logout action
export async function action({ request }: ActionFunctionArgs) {
  return logout(request)
}

// Redirect to logout action for GET requests
export function loader() {
  return redirect('/')
}
