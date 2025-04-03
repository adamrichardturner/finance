import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import type { LinksFunction, MetaFunction } from '@remix-run/node'
import { data } from '@remix-run/node'
import './tailwind.css'
import { QueryProvider } from './providers/query-client'
import { HydrationBoundary } from '@tanstack/react-query'

export const meta: MetaFunction = () => {
  const title = 'FinanceApp - Take control of your finances'
  const description =
    'Track expenses, set budgets, and achieve your financial goals with our intuitive finance management application.'
  const imageUrl = 'https://finance.adamrichardturner.dev/og-image.jpg'

  return [
    { title },
    { name: 'description', content: description },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1',
    },

    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://finance.adamrichardturner.dev' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: imageUrl },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: 'https://finance.adamrichardturner.dev' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
    { name: 'twitter:image:alt', content: 'FinanceApp dashboard preview' },
    { name: 'twitter:creator', content: '@adamrichardturner' },
  ]
}

export async function loader() {
  return data({
    dehydratedState: null,
  })
}

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  },
]

const globalStyles = `
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
  }
  
  .hide-scrollbar {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  
  
  .scrollable-content {
    overflow: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollable-content::-webkit-scrollbar {
    display: none;
  }
`

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body className='min-h-screen bg-[#F8F4F0] w-full dark:bg-gray-900 text-gray-900 dark:text-white font-sans overflow-x-hidden'>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const { dehydratedState } = useLoaderData<{ dehydratedState: unknown }>()

  return (
    <QueryProvider>
      <HydrationBoundary state={dehydratedState}>
        <Outlet />
      </HydrationBoundary>
    </QueryProvider>
  )
}
