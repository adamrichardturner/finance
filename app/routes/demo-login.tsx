import { LoaderFunctionArgs } from '@remix-run/node'
import { loginDemoUser } from '~/services/auth/session.server'

export async function loader({ request }: LoaderFunctionArgs) {
  return loginDemoUser(request)
}

export default function DemoLogin() {
  return null
}
