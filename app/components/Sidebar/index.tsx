import { Link, useLocation } from '@remix-run/react'
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

type MenuItem = {
  name: string
  path: string
  icon: string
  label: string
}

const MENU_ITEMS: MenuItem[] = [
  {
    name: 'overview',
    path: '/dashboard',
    icon: '/assets/icons/OverviewIcon.svg',
    label: 'Overview',
  },
  {
    name: 'transactions',
    path: '/transactions',
    icon: '/assets/icons/TransactionsIcon.svg',
    label: 'Transactions',
  },
  {
    name: 'budgets',
    path: '/budgets',
    icon: '/assets/icons/BudgetsIcon.svg',
    label: 'Budgets',
  },
  {
    name: 'pots',
    path: '/pots',
    icon: '/assets/icons/PotsIcon.svg',
    label: 'Pots',
  },
  {
    name: 'bills',
    path: '/bills',
    icon: '/assets/icons/RecurringBillsIcon.svg',
    label: 'Recurring bills',
  },
]

function TabBar() {
  const location = useLocation()

  const isActive = (path: string): boolean => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/'
    }
    return location.pathname === path
  }

  return (
    <div className='md:hidden fixed bottom-0 left-0 right-0 bg-black h-[68px] flex justify-around items-center z-50'>
      {MENU_ITEMS.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className='flex flex-col items-center justify-center h-full w-1/5'
        >
          <div className='relative flex flex-col items-center pt-3'>
            {isActive(item.path) && (
              <div className='absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#277C78]'></div>
            )}
            <img
              src={item.icon}
              alt={item.label}
              className={`h-5 w-5 mb-1 ${isActive(item.path) ? '[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]' : 'opacity-70'}`}
            />
            <span
              className={`text-xs transition-colors ${isActive(item.path) ? 'text-[#277C78]' : 'text-gray-300'}`}
            >
              {item.label}
            </span>
          </div>
        </Link>
      ))}
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
      className='hidden md:block bg-gray-900 text-white border-r-0 [border-radius:0px_var(--spacing-200,16px)_var(--spacing-200,16px)_0px] [&.group[data-collapsible="icon"]_.group-data-\[collapsible\=icon\]\:\!size-8]:!w-[3rem]'
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
          {MENU_ITEMS.map((item) => (
            <SidebarMenuItem key={item.name} className={`group/${item.name}`}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                className={`${
                  isCollapsed
                    ? 'flex items-center w-full justify-center p-4'
                    : 'h-[56px] px-[26px] py-[16px]'
                } text-white data-[active=true]:bg-gray-800 group-hover/${item.name}:bg-[#F8F4F0] border-l-4 border-l-transparent group-hover/${item.name}:border-l-[#277C78] transition-all duration-200 w-full`}
              >
                <Link
                  to={item.path}
                  className={`flex ${
                    isCollapsed ? 'justify-center' : 'justify-start'
                  } items-center w-full gap-4`}
                >
                  <div className='flex items-center justify-center'>
                    <img
                      src={item.icon}
                      alt={item.label}
                      className={`w-6 transition-all duration-200 hover:[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]`}
                    />
                  </div>
                  {!isCollapsed && (
                    <span className='font-[600] text-gray-300 transition-colors duration-200 group-hover/${item.name}:text-gray-900'>
                      {item.label}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContentSection>

      <SidebarFooter className='group/minimize'>
        <SidebarMenuButton
          className={`w-full ${
            isCollapsed
              ? 'flex items-center justify-center p-4 !w-[3rem] !min-w-[3rem]'
              : 'h-[56px] px-[26px] py-[16px]'
          } text-white border-0 mb-[132px] border-l-4 border-l-transparent transition-all duration-200 hover:bg-[#F8F4F0] hover:border-l-[#277C78]`}
          tooltip='Minimize Menu'
          onClick={toggleSidebar}
        >
          <div
            className={`flex ${
              isCollapsed
                ? 'justify-center items-center w-full'
                : 'items-center gap-4'
            }`}
          >
            <div className='flex items-center justify-center'>
              <img
                src='/assets/icons/MinimizeIcon.svg'
                alt='Minimize Sidebar'
                className={`w-6 transition-all duration-200`}
              />
            </div>
            <span className='text-gray-300 transition-colors duration-200 hover:text-gray-900 group-data-[collapsible=icon]:hidden'>
              Minimize Menu
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AppSidebar() {
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
