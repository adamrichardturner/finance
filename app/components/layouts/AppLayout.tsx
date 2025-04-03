import * as React from 'react'
import { ClientSidebarWrapper } from '~/components/Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className='flex min-h-screen w-full'>
      <ClientSidebarWrapper />
      <div className='flex flex-col flex-1 w-full min-h-screen pl-4 md:pl-10'>
        <main className='flex-1 w-full h-full pb-[106px] pt-[16px] sm:pt-[40px] max-w-[1200px]'>
          {children}
        </main>
      </div>
    </div>
  )
}
