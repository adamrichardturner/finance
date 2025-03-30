import { Link, useLocation } from '@remix-run/react'
import { AnimatePresence, motion } from 'framer-motion'
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

// Add custom styles to the head
const CUSTOM_STYLES = `
  .filter-active-icon {
    filter: invert(27%) sepia(44%) saturate(489%) hue-rotate(127deg) brightness(92%) contrast(90%);
  }
  
  .sidebar-menu-container:hover .sidebar-hover-icon {
    filter: invert(27%) sepia(44%) saturate(489%) hue-rotate(127deg) brightness(92%) contrast(90%);
  }
`
// Add styles to document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = CUSTOM_STYLES
  document.head.appendChild(style)
}

type MenuItem = {
  name: string
  path: string
  icon: string
  label: string
}

const MENU_ITEMS: MenuItem[] = [
  {
    name: 'overview',
    path: '/overview',
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

// Mobile TabBar for small screens (xs only)
function MobileTabBar() {
  const location = useLocation()

  const isActive = (path: string): boolean => {
    if (path === '/overview') {
      return location.pathname === '/overview' || location.pathname === '/'
    }
    return location.pathname === path
  }

  // For mobile, we'll use 4 items (excluding Pots)
  const mobileMenuItems = MENU_ITEMS.filter((item) => item.name !== 'pots')

  return (
    <div className='sm:hidden fixed bottom-0 left-0 right-0 bg-black h-[68px] flex justify-around items-center z-50'>
      {mobileMenuItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className='flex flex-col items-center justify-center h-full w-1/4'
        >
          <div className='relative flex flex-col items-center pt-3'>
            {isActive(item.path) && (
              <div className='absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#277C78]'></div>
            )}
            <img
              src={item.icon}
              alt={item.label}
              className={`h-5 w-5 mb-1 ${
                isActive(item.path)
                  ? '[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]'
                  : 'opacity-70'
              }`}
            />
          </div>
        </Link>
      ))}
    </div>
  )
}

// Medium screens TabBar (sm to md)
function TabBar() {
  const location = useLocation()

  const isActive = (path: string): boolean => {
    if (path === '/overview') {
      return location.pathname === '/overview' || location.pathname === '/'
    }
    return location.pathname === path
  }

  return (
    <div className='hidden sm:flex md:hidden fixed bottom-0 left-0 right-0 bg-black h-[68px] justify-around items-center z-50'>
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
              className={`h-5 w-5 mb-1 ${
                isActive(item.path)
                  ? '[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]'
                  : 'opacity-70'
              }`}
            />
            <span
              className={`text-xs transition-colors ${
                isActive(item.path) ? 'text-[#277C78]' : 'text-gray-300'
              }`}
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
  const location = useLocation()
  const isCollapsed = state === 'collapsed'

  const handleMinimize = () => {
    toggleSidebar()
  }

  return (
    <Sidebar
      side='left'
      variant='sidebar'
      collapsible='icon'
      className={
        `${isCollapsed ? 'w-[92px]' : 'w-[300px]'}` +
        `hidden md:block bg-gray-900 text-white border-r-0 [border-radius:0px_var(--spacing-200,16px)_var(--spacing-200,16px)_0px] [&.group[data-collapsible="icon"]_.group-data-\[collapsible\=icon\]\:\!size-8]:!w-[92px]`
      }
    >
      <SidebarHeader
        className={`p-4 flex flex-row justify-between items-center ${
          isCollapsed ? 'px-4 py-[40px] justify-center' : 'px-[32px] py-[40px]'
        }`}
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
        <SidebarMenu className='flex flex-col gap-2 pr-6'>
          {MENU_ITEMS.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === '/overview' && location.pathname === '/')

            return (
              <SidebarMenuItem
                key={item.name}
                className='w-full flex justify-center'
              >
                <Link to={item.path} className='w-full'>
                  <SidebarMenuButton
                    tooltip={item.label}
                    className={`${
                      isCollapsed
                        ? 'flex w-[92px] items-center justify-center p-4'
                        : 'flex h-[56px] px-[32px] py-[16px] items-center gap-[16px]'
                    } text-white rounded-r-[12px] hover:bg-[#F8F4F0] sidebar-menu-container`}
                    data-active={isActive}
                  >
                    <div
                      className={`flex ${
                        isCollapsed
                          ? 'justify-center items-center w-full'
                          : 'items-center gap-4'
                      } w-full h-full cursor-pointer`}
                    >
                      <div className='flex items-center justify-center'>
                        <img
                          src={item.icon}
                          alt={item.label}
                          className={`${isCollapsed ? 'w-[24px] h-[24px]' : 'w-6'} 
                            ${isActive ? 'filter-active-icon' : ''} 
                            sidebar-hover-icon transition-all duration-200`}
                        />
                      </div>
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            key='text'
                            initial='hidden'
                            animate='visible'
                            exit='hidden'
                            variants={textDisplayVariants}
                            className={`sidebar-menu-text font-["Public_Sans"] text-[16px] font-bold leading-[150%]`}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContentSection>

      <SidebarFooter className='p-0 w-full flex items-center justify-center mb-12'>
        <SidebarMenuItem className='w-full flex justify-center'>
          <SidebarMenuButton
            tooltip='Minimize Menu'
            data-active={false}
            className={`${
              isCollapsed
                ? 'flex w-[92px] items-center justify-center p-4'
                : 'flex w-[300px] h-[56px] px-[32px] py-[16px] items-center gap-[16px]'
            } text-white rounded-r-[12px] hover:bg-[#F8F4F0] sidebar-menu-container`}
            onClick={handleMinimize}
          >
            <div
              className={`flex ${
                isCollapsed
                  ? 'justify-center items-center w-full'
                  : 'items-center gap-4'
              } w-full h-full cursor-pointer`}
            >
              <div className='flex items-center justify-center'>
                <img
                  src='/assets/icons/MinimizeIcon.svg'
                  alt='Minimize Menu'
                  className={`${isCollapsed ? 'w-[24px] h-[24px]' : 'w-6'} 
                    sidebar-hover-icon transition-all duration-200`}
                />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    key='minimize-text'
                    initial='hidden'
                    animate='visible'
                    exit='hidden'
                    variants={textDisplayVariants}
                    className={`sidebar-menu-text font-["Public_Sans"] text-[16px] font-bold leading-[150%]`}
                  >
                    Minimize Menu
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
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
      <MobileTabBar />
      <div className='md:hidden h-[68px]'></div>
    </>
  )
}

const buttonVariants = {
  initial: {
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderLeftWidth: '0px',
  },
  hover: {
    backgroundColor: '#F8F4F0',
    borderLeftColor: 'transparent',
    borderLeftWidth: '0px',
  },
  active: {
    backgroundColor: '#F8F4F0',
    borderLeftColor: '#277C78',
    borderLeftWidth: '4px',
  },
}

const iconVariants = {
  initial: { filter: 'none' },
  hover: {
    filter:
      'invert(27%) sepia(44%) saturate(489%) hue-rotate(127deg) brightness(92%) contrast(90%)',
  },
  active: {
    filter:
      'invert(27%) sepia(44%) saturate(489%) hue-rotate(127deg) brightness(92%) contrast(90%)',
  },
}

const textDisplayVariants = {
  hidden: { opacity: 0, display: 'none', transition: { duration: 0.01 } },
  visible: {
    opacity: 1,
    display: 'block',
    transition: {
      delay: 0.15,
      duration: 0.2,
    },
  },
}
