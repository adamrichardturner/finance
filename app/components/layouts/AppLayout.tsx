import * as React from 'react'
import { useLocation } from '@remix-run/react'
import { Menu } from 'lucide-react'
import { SidebarProvider, useSidebar } from '~/components/ui/sidebar'
import { AppSidebar } from '../Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

function MobileMenuButton() {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      type='button'
      onClick={toggleSidebar}
      className='mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800'
    >
      <Menu className='h-6 w-6' />
      <span className='sr-only'>Toggle menu</span>
    </button>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className='flex min-h-screen w-full'>
        <AppSidebar />
        {/* Content wrapper - takes all remaining width */}
        <div className='flex flex-col flex-1 w-full min-h-screen'>
          {/* Mobile header */}
          <div className='fixed top-0 left-0 right-0 z-40 flex h-16 items-center border-b bg-background px-4 lg:hidden'>
            <MobileMenuButton />
            <span className='font-semibold'>FinanceApp</span>
          </div>

          {/* Main content area */}
          <main className='flex-1 w-full h-full p-[40px]'>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
