import { Outlet } from '@remix-run/react'
import { AppLayout } from '~/components/layouts/AppLayout'

export const loader = async () => {
  return {}
}

export default function Finance() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
