import { LoaderFunctionArgs } from '@remix-run/node'
import { loginDemoUser } from '~/services/auth/session.server'

/**
 * Demo login route - automatically logs in with demo account
 */
export async function loader({ request }: LoaderFunctionArgs) {
  return loginDemoUser(request)
}

export default function DemoLogin() {
  // This component shouldn't be rendered as we redirect in the loader
  return null
}
