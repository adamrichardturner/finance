import * as React from 'react'
import { Link, useLocation } from '@remix-run/react'
import {
  LayoutDashboard,
  WalletCards,
  Settings,
  BarChart3,
  BellRing,
  LogOut,
  Menu,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'
import { AppSidebar } from '../Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

function isActiveRoute(pathname: string, route: string): boolean {
  if (route === '/dashboard' && pathname === '/dashboard') {
    return true
  }
  if (route !== '/dashboard' && pathname.startsWith(route)) {
    return true
  }
  return false
}

// Create a simple mobile menu button component using useSidebar
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
  const location = useLocation()

  // Add debug logs
  console.log('Rendering AppLayout with SidebarProvider')

  // Use React.useEffect for additional debugging
  React.useEffect(() => {
    console.log('Inside SidebarProvider (from effect)')
  }, [])

  return (
    <SidebarProvider>
      <div className='flex min-h-screen'>
        <AppSidebar />
        {/* Mobile header */}
        <div className='fixed top-0 left-0 right-0 z-40 flex h-16 items-center border-b bg-background px-4 lg:hidden'>
          <MobileMenuButton />
          <span className='font-semibold'>FinanceApp</span>
        </div>

        {/* Content */}
        <div className='flex-1 pt-16 lg:pt-0'>
          <main className='container p-4 lg:p-6'>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
