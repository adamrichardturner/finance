import * as React from 'react'
import { SidebarProvider, useSidebar } from '~/components/ui/sidebar'
import { AppSidebar } from '../Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className='flex min-h-screen w-full'>
        <AppSidebar />
        <div className='flex flex-col flex-1 w-full min-h-screen'>
          <main className='flex-1 w-full h-full p-[16px] sm:p-[40px] pb-[106px] md:pb-[40px] max-w-[1200px]'>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
