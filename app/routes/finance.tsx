import { Outlet } from '@remix-run/react'
import { LoaderFunctionArgs } from '@remix-run/node'
import { AppLayout } from '~/components/layouts/AppLayout'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // You can add auth checks here if needed
  return {}
}

export default function Finance() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
