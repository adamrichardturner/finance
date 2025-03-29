import { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getUser, requireUserId } from '~/services/auth/session.server'
import { AppLayout } from '~/components/layouts/AppLayout'
import Overview from '~/components/Overview'

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request)

  const user = await getUser(request)

  const isDemoUser = user?.id === 'demo-user-id'

  return Response.json({
    user,
    isDemoUser,
    requestUrl: request.url,
  })
}

export default function OverviewPage() {
  const { user, isDemoUser, requestUrl } = useLoaderData<typeof loader>()

  return (
    <AppLayout>
      <Overview isDemoUser={isDemoUser} requestUrl={requestUrl} />
    </AppLayout>
  )
}
