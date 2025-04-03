import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { logout } from '~/services/auth/session.server'

export async function action({ request }: ActionFunctionArgs) {
  return logout(request)
}

export function loader() {
  return redirect('/')
}
