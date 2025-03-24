import { Link } from '@remix-run/react'
import { ChevronsLeft } from 'lucide-react'
import {
  Sidebar,
  SidebarContent as SidebarContentSection,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  useSidebar,
} from '~/components/ui/sidebar'
import { useEffect, useState } from 'react'

// TabBar component for tablet view
function TabBar() {
  const [currentPath, setCurrentPath] = useState('')

  // Update the current path on navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  const isActive = (path: string): boolean => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/'
    }
    return currentPath === path
  }

  return (
    <div className='md:hidden fixed bottom-0 left-0 right-0 bg-black h-[68px] flex justify-around items-center z-50'>
      <Link
        to='/dashboard'
        className='flex flex-col items-center justify-center h-full w-1/5'
      >
        <div className='relative flex flex-col items-center pt-3'>
          {isActive('/dashboard') && (
            <div className='absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#277C78]'></div>
          )}
          <img
            src='/assets/icons/OverviewIcon.svg'
            alt='Overview'
            className={`h-5 w-5 mb-1 ${isActive('/dashboard') ? '[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]' : 'opacity-70'}`}
          />
          <span
            className={`text-xs transition-colors ${isActive('/dashboard') ? 'text-[#277C78]' : 'text-gray-300'}`}
          >
            Overview
          </span>
        </div>
      </Link>

      <Link
        to='/transactions'
        className='flex flex-col items-center justify-center h-full w-1/5'
      >
        <div className='relative flex flex-col items-center pt-3'>
          {isActive('/transactions') && (
            <div className='absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#277C78]'></div>
          )}
          <img
            src='/assets/icons/TransactionsIcon.svg'
            alt='Transactions'
            className={`h-5 w-5 mb-1 ${isActive('/transactions') ? '[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]' : 'opacity-70'}`}
          />
          <span
            className={`text-xs transition-colors ${isActive('/transactions') ? 'text-[#277C78]' : 'text-gray-300'}`}
          >
            Transactions
          </span>
        </div>
      </Link>

      <Link
        to='/budgets'
        className='flex flex-col items-center justify-center h-full w-1/5'
      >
        <div className='relative flex flex-col items-center pt-3'>
          {isActive('/budgets') && (
            <div className='absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#277C78]'></div>
          )}
          <img
            src='/assets/icons/BudgetsIcon.svg'
            alt='Budgets'
            className={`h-5 w-5 mb-1 ${isActive('/budgets') ? '[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]' : 'opacity-70'}`}
          />
          <span
            className={`text-xs transition-colors ${isActive('/budgets') ? 'text-[#277C78]' : 'text-gray-300'}`}
          >
            Budgets
          </span>
        </div>
      </Link>

      <Link
        to='/pots'
        className='flex flex-col items-center justify-center h-full w-1/5'
      >
        <div className='relative flex flex-col items-center pt-3'>
          {isActive('/pots') && (
            <div className='absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#277C78]'></div>
          )}
          <img
            src='/assets/icons/PotsIcon.svg'
            alt='Pots'
            className={`h-5 w-5 mb-1 ${isActive('/pots') ? '[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]' : 'opacity-70'}`}
          />
          <span
            className={`text-xs transition-colors ${isActive('/pots') ? 'text-[#277C78]' : 'text-gray-300'}`}
          >
            Pots
          </span>
        </div>
      </Link>

      <Link
        to='/bills'
        className='flex flex-col items-center justify-center h-full w-1/5'
      >
        <div className='relative flex flex-col items-center pt-3'>
          {isActive('/bills') && (
            <div className='absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#277C78]'></div>
          )}
          <img
            src='/assets/icons/RecurringBillsIcon.svg'
            alt='Recurring Bills'
            className={`h-5 w-5 mb-1 ${isActive('/bills') ? '[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]' : 'opacity-70'}`}
          />
          <span
            className={`text-xs transition-colors ${isActive('/bills') ? 'text-[#277C78]' : 'text-gray-300'}`}
          >
            Bills
          </span>
        </div>
      </Link>
    </div>
  )
}

export function SidebarContents() {
  const { state, toggleSidebar } = useSidebar()

  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar
      side='left'
      variant='sidebar'
      collapsible='icon'
      className='hidden md:block bg-gray-900 text-white border-r-0 [border-radius:0px_var(--spacing-200,16px)_var(--spacing-200,16px)_0px]'
    >
      <SidebarHeader
        className={`p-4 flex flex-row justify-between items-center ${isCollapsed ? 'px-4 py-[40px]' : 'px-[32px] py-[40px]'}`}
      >
        <div className='flex items-center'>
          {isCollapsed ? (
            <img
              src='/assets/logos/LogoMobile.svg'
              alt='Finance'
              className='h-auto w-auto'
            />
          ) : (
            <img
              src='/assets/logos/LogoDesktop.svg'
              alt='Finance'
              className='h-6'
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContentSection>
        <SidebarMenu>
          <SidebarMenuItem className='group/overview'>
            <SidebarMenuButton
              asChild
              tooltip='Overview'
              className={`${isCollapsed ? 'py-4 px-4 flex justify-center md:h-auto' : 'h-[56px] px-[32px] py-[16px]'} text-white data-[active=true]:bg-gray-800 group-hover/overview:bg-[#F8F4F0] border-l-4 border-l-transparent group-hover/overview:border-l-[#277C78] transition-all duration-200`}
            >
              <Link
                to='/dashboard'
                className={`flex ${isCollapsed ? 'justify-center md:h-auto' : 'items-center'}`}
              >
                <img
                  src='/assets/icons/OverviewIcon.svg'
                  alt='Overview'
                  className={`${isCollapsed ? 'h-auto w-auto' : 'h-5 w-5'} transition-all duration-200 group-hover/overview:[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]`}
                />
                {!isCollapsed && (
                  <span className='font-[600] ml-2 text-gray-300 transition-colors duration-200 group-hover/overview:text-gray-900'>
                    Overview
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className='group/transactions'>
            <SidebarMenuButton
              asChild
              tooltip='Transactions'
              className={`${isCollapsed ? 'py-4 px-4 flex justify-center md:h-auto' : 'h-[56px] px-[32px] py-[16px]'} text-white data-[active=true]:bg-gray-800 group-hover/transactions:bg-[#F8F4F0] border-l-4 border-l-transparent group-hover/transactions:border-l-[#277C78] transition-all duration-200`}
            >
              <Link
                to='/transactions'
                className={`flex ${isCollapsed ? 'justify-center md:h-auto' : 'items-center'}`}
              >
                <img
                  src='/assets/icons/TransactionsIcon.svg'
                  alt='Transactions'
                  className={`${isCollapsed ? 'h-auto w-auto' : 'h-5 w-5'} transition-all duration-200 group-hover/transactions:[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]`}
                />
                {!isCollapsed && (
                  <span className='font-[600] ml-2 text-gray-300 transition-colors duration-200 group-hover/transactions:text-gray-900'>
                    Transactions
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className='group/budgets'>
            <SidebarMenuButton
              asChild
              tooltip='Budgets'
              className={`${isCollapsed ? 'py-4 px-4 flex justify-center md:h-auto' : 'h-[56px] px-[32px] py-[16px]'} text-white data-[active=true]:bg-gray-800 group-hover/budgets:bg-[#F8F4F0] border-l-4 border-l-transparent group-hover/budgets:border-l-[#277C78] transition-all duration-200`}
            >
              <Link
                to='/budgets'
                className={`flex ${isCollapsed ? 'justify-center md:h-auto' : 'items-center'}`}
              >
                <img
                  src='/assets/icons/BudgetsIcon.svg'
                  alt='Budgets'
                  className={`${isCollapsed ? 'h-auto w-auto' : 'h-5 w-5'} transition-all duration-200 group-hover/budgets:[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]`}
                />
                {!isCollapsed && (
                  <span className='font-[600] ml-2 text-gray-300 transition-colors duration-200 group-hover/budgets:text-gray-900'>
                    Budgets
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className='group/pots'>
            <SidebarMenuButton
              asChild
              tooltip='Pots'
              className={`${isCollapsed ? 'py-4 px-4 flex justify-center md:h-auto' : 'h-[56px] px-[32px] py-[16px]'} text-white data-[active=true]:bg-gray-800 group-hover/pots:bg-[#F8F4F0] border-l-4 border-l-transparent group-hover/pots:border-l-[#277C78] transition-all duration-200`}
            >
              <Link
                to='/pots'
                className={`flex ${isCollapsed ? 'justify-center md:h-auto' : 'items-center'}`}
              >
                <img
                  src='/assets/icons/PotsIcon.svg'
                  alt='Pots'
                  className={`${isCollapsed ? 'h-auto w-auto' : 'h-5 w-5'} transition-all duration-200 group-hover/pots:[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]`}
                />
                {!isCollapsed && (
                  <span className='font-[600] ml-2 text-gray-300 transition-colors duration-200 group-hover/pots:text-gray-900'>
                    Pots
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className='group/bills'>
            <SidebarMenuButton
              asChild
              tooltip='Recurring bills'
              className={`${isCollapsed ? 'py-4 px-4 flex justify-center md:h-auto' : 'h-[56px] px-[32px] py-[16px]'} text-white data-[active=true]:bg-gray-800 group-hover/bills:bg-[#F8F4F0] border-l-4 border-l-transparent group-hover/bills:border-l-[#277C78] transition-all duration-200`}
            >
              <Link
                to='/bills'
                className={`flex ${isCollapsed ? 'justify-center md:h-auto' : 'items-center'}`}
              >
                <img
                  src='/assets/icons/RecurringBillsIcon.svg'
                  alt='Recurring Bills'
                  className={`${isCollapsed ? 'h-auto w-auto' : 'h-5 w-5'} transition-all duration-200 group-hover/bills:[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]`}
                />
                {!isCollapsed && (
                  <span className='font-[600] ml-2 text-gray-300 transition-colors duration-200 group-hover/bills:text-gray-900'>
                    Recurring bills
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContentSection>

      <SidebarFooter className='group/minimize'>
        <SidebarMenuButton
          className={`w-full ${isCollapsed ? 'py-4 px-4 flex justify-center md:h-auto' : 'h-[56px] px-[32px] py-[16px] justify-start'} text-white border-0 group-hover/minimize:bg-[#F8F4F0] border-l-4 border-l-transparent group-hover/minimize:border-l-[#277C78] transition-all duration-200`}
          tooltip='Minimize Menu'
          onClick={toggleSidebar}
        >
          <div
            className={`flex ${isCollapsed ? 'justify-center md:h-auto' : 'items-start'}`}
          >
            <img
              src='/assets/icons/MinimizeIcon.svg'
              alt='Minimize Sidebar'
              className={`${isCollapsed ? 'h-auto w-auto' : 'h-5 w-5'} transition-all duration-200 group-hover/minimize:[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]`}
            />
            {!isCollapsed && (
              <span className='ml-2 text-gray-300 transition-colors duration-200 group-hover/minimize:text-gray-900'>
                Minimize Menu
              </span>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AppSidebar() {
  const [currentPath, setCurrentPath] = useState('')

  // Update the current path on navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  return (
    <>
      <SidebarProvider>
        <SidebarContents />
      </SidebarProvider>
      <TabBar />
      {/* Add padding to the bottom of the content for tablet view */}
      <div className='md:hidden h-[68px]'></div>
    </>
  )
}
