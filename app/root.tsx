import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import type { LinksFunction, MetaFunction } from '@remix-run/node'
import './tailwind.css'
import { QueryProvider } from './providers/query-client'

export const meta: MetaFunction = () => {
  return [
    { title: 'FinanceApp - Take control of your finances' },
    {
      name: 'description',
      content:
        'Track expenses, set budgets, and achieve your financial goals with our intuitive finance management application.',
    },
  ]
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
    href: 'https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

// Global styles for the application
const globalStyles = `
  /* Custom scrollbar hiding class */
  .hide-scrollbar::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
  }
  
  .hide-scrollbar {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  
  /* Ensure content still scrolls but without showing scrollbars */
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
  console.log('Rendering App (root) component')
  return (
    <QueryProvider>
      <Outlet />
    </QueryProvider>
  )
}
