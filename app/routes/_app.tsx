import { Outlet } from '@remix-run/react'
import { LoaderFunctionArgs } from '@remix-run/node'
import { AppLayout } from '~/components/layouts/AppLayout'

export const loader = async ({}: LoaderFunctionArgs) => {
  return {}
}

export default function AppRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
