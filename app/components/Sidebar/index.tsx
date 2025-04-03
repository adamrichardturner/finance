import { Link, useLocation } from '@remix-run/react'
import { AnimatePresence, motion } from 'framer-motion'
import { ClientOnly } from 'remix-utils/client-only'
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
import React from 'react'

const SidebarStyles = () => {
  React.useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .filter-active-icon {
        filter: invert(27%) sepia(44%) saturate(489%) hue-rotate(127deg) brightness(92%) contrast(90%) !important;
      }
      
      .sidebar-menu-container:not([data-active="true"]):hover .sidebar-hover-icon {
        filter: brightness(0) invert(1) !important;
      }

      .sidebar-menu-container:not([data-active="true"]):hover .sidebar-menu-text {
        color: #FFFFFF !important;
      }

      .sidebar-hover-icon {
        filter: invert(88%) sepia(0%) saturate(29%) hue-rotate(214deg) brightness(111%) contrast(87%);
      }

      .filter-white {
        filter: brightness(0) invert(1) !important;
      }

      .sidebar-menu-text {
        color: #e0e0e0;
      }

      [data-active="true"] .sidebar-menu-text {
        color: #212121 !important;
      }
      
      [data-active="true"] .sidebar-hover-icon {
        filter: invert(27%) sepia(44%) saturate(489%) hue-rotate(127deg) brightness(92%) contrast(90%) !important;
      }

      /* Add sidebar border radius styles */
      .Sidebar, [data-sidebar] {
        border-top-right-radius: 16px !important;
        border-bottom-right-radius: 16px !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return null
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
    name: 'recurring-bills',
    path: '/recurring-bills',
    icon: '/assets/icons/RecurringBillsIcon.svg',
    label: 'Recurring bills',
  },
]

function MobileTabBar() {
  const location = useLocation()

  const isActive = (path: string): boolean => {
    if (path === '/overview') {
      return location.pathname === '/overview' || location.pathname === '/'
    }
    return location.pathname === path
  }

  const isEnabled = (name: string): boolean => {
    return (
      name === 'overview' ||
      name === 'transactions' ||
      name === 'budgets' ||
      name === 'pots' ||
      name === 'recurring-bills'
    )
  }

  return (
    <div className='sm:hidden fixed bottom-0 pt-2 left-0 pl-2 right-0 bg-[#201F24] h-[74px] flex justify-around items-center z-50 rounded-tl-lg rounded-tr-lg'>
      {MENU_ITEMS.map((item) => {
        const enabled = isEnabled(item.name)

        return enabled ? (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center h-full flex-1 ${
              isActive(item.path)
                ? 'rounded-t-lg border-b-4 border-[#277C78] bg-[#F8F4F0] py-[8px] px-0 pb-[12px] gap-[4px]'
                : 'py-3'
            }`}
          >
            <img
              src={item.icon}
              alt={item.label}
              className={`h-5 w-5 ${
                isActive(item.path)
                  ? '[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]'
                  : 'opacity-70'
              }`}
            />
          </Link>
        ) : (
          <div
            key={item.name}
            className='flex flex-col items-center justify-center h-full flex-1 py-3 opacity-40 cursor-not-allowed'
            aria-disabled={true}
          >
            <img
              src={item.icon}
              alt={item.label}
              className='h-5 w-5 opacity-70'
            />
          </div>
        )
      })}
    </div>
  )
}

function TabBar() {
  const location = useLocation()

  const isActive = (path: string): boolean => {
    if (path === '/overview') {
      return location.pathname === '/overview' || location.pathname === '/'
    }
    return location.pathname === path
  }

  const isEnabled = (name: string): boolean => {
    return (
      name === 'overview' ||
      name === 'transactions' ||
      name === 'budgets' ||
      name === 'pots' ||
      name === 'recurring-bills'
    )
  }

  return (
    <div className='hidden sm:flex md:hidden fixed bottom-0 left-0 right-0 bg-[#201F24] h-[72px] justify-around items-center z-50 rounded-tl-lg rounded-tr-lg'>
      {MENU_ITEMS.map((item) => {
        const enabled = isEnabled(item.name)

        return enabled ? (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center h-full flex-1 ${
              isActive(item.path)
                ? 'rounded-t-lg border-b-4 border-[#277C78] bg-[#F8F4F0] py-[8px] px-0 pb-[12px] gap-[4px]'
                : 'py-3 gap-1'
            }`}
          >
            <img
              src={item.icon}
              alt={item.label}
              className={`h-5 w-5 ${
                isActive(item.path)
                  ? '[filter:invert(27%)_sepia(44%)_saturate(489%)_hue-rotate(127deg)_brightness(92%)_contrast(90%)]'
                  : 'opacity-70'
              }`}
            />
            <span
              className={`text-xs ${
                isActive(item.path) ? 'text-[#277C78]' : 'text-gray-300'
              }`}
            >
              {item.label}
            </span>
          </Link>
        ) : (
          <div
            key={item.name}
            className='flex flex-col items-center justify-center h-full flex-1 py-3 gap-1 opacity-40 cursor-not-allowed'
            aria-disabled={true}
          >
            <img
              src={item.icon}
              alt={item.label}
              className='h-5 w-5 opacity-70'
            />
            <span className='text-xs text-gray-300'>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

const textFadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const logoFadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export function SidebarContents() {
  const { state, toggleSidebar } = useSidebar()
  const location = useLocation()
  const isCollapsed = state === 'collapsed'

  const handleMinimize = () => {
    toggleSidebar()
  }

  const isEnabled = (name: string): boolean => {
    return (
      name === 'overview' ||
      name === 'transactions' ||
      name === 'budgets' ||
      name === 'pots' ||
      name === 'recurring-bills'
    )
  }

  const isItemActive = (path: string): boolean => {
    if (typeof window === 'undefined') return false

    if (path === '/overview') {
      return location.pathname === '/overview' || location.pathname === '/'
    }
    return location.pathname === path
  }

  return (
    <Sidebar
      side='left'
      variant='sidebar'
      collapsible='icon'
      className={`
        ${isCollapsed ? 'w-[92px]' : 'w-[300px]'}
        hidden md:block bg-gray-900 text-white border-r-0 
        rounded-tr-[16px] !rounded-tr-[16px] rounded-br-[16px] !rounded-br-[16px]
      `}
      style={{
        borderTopRightRadius: '16px',
        borderBottomRightRadius: '16px',
      }}
    >
      <SidebarHeader
        className={`flex flex-row justify-between items-center ${
          isCollapsed ? 'px-4 py-[40px] justify-center' : 'pl-[26px] py-[40px]'
        }`}
      >
        <div className='flex items-center'>
          <Link to='/overview'>
            <AnimatePresence mode='wait'>
              {isCollapsed ? (
                <motion.div
                  key='mobile-logo'
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  variants={logoFadeVariants}
                  transition={{ duration: 0.1 }}
                >
                  <img
                    src='/assets/logos/LogoMobile.svg'
                    alt='Finance'
                    className='h-auto w-auto cursor-pointer'
                  />
                </motion.div>
              ) : (
                <motion.div
                  key='desktop-logo'
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  variants={logoFadeVariants}
                  transition={{ duration: 0.1 }}
                >
                  <img
                    src='/assets/logos/LogoDesktop.svg'
                    alt='Finance'
                    className='h-6 cursor-pointer'
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContentSection>
        <SidebarMenu
          className={`flex flex-col gap-4 px-0 ${isCollapsed ? 'pr-0' : 'pr-4'}`}
        >
          {MENU_ITEMS.map((item) => {
            const active = isItemActive(item.path)
            const enabled = isEnabled(item.name)

            return (
              <SidebarMenuItem key={item.name} className='w-full'>
                {enabled ? (
                  <Link
                    to={item.path}
                    className={
                      isCollapsed
                        ? 'w-full flex flex-1 justify-center'
                        : 'w-full'
                    }
                  >
                    <SidebarMenuButton
                      tooltip={item.label}
                      className={`${
                        isCollapsed
                          ? 'flex w-full h-[56px] items-center justify-center'
                          : 'flex h-[56px] w-full items-center gap-[16px] px-4'
                      } text-white rounded-lg ${active ? 'bg-[#F8F4F0]' : ''} sidebar-menu-container`}
                      data-active={active ? 'true' : 'false'}
                    >
                      <div
                        className={`flex ${
                          isCollapsed
                            ? 'justify-center items-center w-full'
                            : 'items-center gap-4'
                        } h-full cursor-pointer`}
                      >
                        <div className='flex items-center justify-center w-6 h-6'>
                          <img
                            src={item.icon}
                            alt={item.label}
                            className={`w-5 h-5 sidebar-hover-icon ${active ? 'filter-active-icon' : ''}`}
                          />
                        </div>
                        <AnimatePresence mode='wait'>
                          {!isCollapsed && (
                            <motion.span
                              key={`menu-text-${item.name}`}
                              initial='hidden'
                              animate='visible'
                              exit='exit'
                              variants={textFadeVariants}
                              transition={{ duration: 0.1 }}
                              className={`sidebar-menu-text font-["Public_Sans"] text-[16px] font-medium leading-[150%]`}
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </SidebarMenuButton>
                  </Link>
                ) : (
                  <div
                    className={
                      isCollapsed
                        ? 'w-full flex flex-1 justify-center'
                        : 'w-full'
                    }
                  >
                    <SidebarMenuButton
                      tooltip={item.label}
                      className={`${
                        isCollapsed
                          ? 'flex w-full h-[56px] items-center justify-center'
                          : 'flex h-[56px] w-full items-center gap-[16px] px-4'
                      } text-white rounded-lg opacity-40 cursor-not-allowed`}
                      disabled={true}
                    >
                      <div
                        className={`flex ${
                          isCollapsed
                            ? 'justify-center items-center w-full'
                            : 'items-center gap-4'
                        } h-full cursor-not-allowed`}
                      >
                        <div className='flex items-center justify-center w-6 h-6'>
                          <img
                            src={item.icon}
                            alt={item.label}
                            className='w-5 h-5'
                          />
                        </div>
                        <AnimatePresence mode='wait'>
                          {!isCollapsed && (
                            <motion.span
                              key={`menu-text-${item.name}`}
                              initial='hidden'
                              animate='visible'
                              exit='exit'
                              variants={textFadeVariants}
                              transition={{ duration: 0.1 }}
                              className={`sidebar-menu-text font-["Public_Sans"] text-[16px] font-medium leading-[150%]`}
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </SidebarMenuButton>
                  </div>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContentSection>

      <SidebarFooter className='p-0 w-full flex items-center justify-center mb-6'>
        <SidebarMenuButton
          tooltip={isCollapsed ? 'Expand Menu' : 'Minimize Menu'}
          data-active={false}
          className={`${
            isCollapsed
              ? 'flex w-full h-[48px] items-center gap-[16px] justify-center'
              : 'flex w-full h-[48px] items-center gap-[16px] px-4'
          } text-white rounded-lg sidebar-menu-container`}
          onClick={handleMinimize}
        >
          <div
            className={`flex ${
              isCollapsed
                ? 'justify-center items-center w-full'
                : 'items-center gap-4'
            } h-full cursor-pointer`}
          >
            <div
              className={
                isCollapsed
                  ? 'flex items-center justify-center'
                  : 'flex items-center justify-center w-6 h-6'
              }
            >
              <img
                src={
                  isCollapsed
                    ? '/assets/icons/ExpandIcon.svg'
                    : '/assets/icons/MinimizeIcon.svg'
                }
                alt={isCollapsed ? 'Expand Menu' : 'Minimize Menu'}
                className={`w-5 h-5 ${isCollapsed ? 'filter-white' : 'sidebar-hover-icon'}`}
                style={{
                  width: '20px',
                  height: '20px',
                  display: 'block',
                }}
              />
            </div>
            <AnimatePresence mode='wait'>
              {!isCollapsed && (
                <motion.span
                  key='minimize-text'
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  variants={textFadeVariants}
                  transition={{ duration: 0.1 }}
                  className={`sidebar-menu-text font-["Public_Sans"] text-[16px] font-medium leading-[150%]`}
                >
                  {isCollapsed ? 'Expand Menu' : 'Minimize Menu'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}

export function ClientSidebarWrapper() {
  const placeholder = (
    <div
      className='bg-gray-900 h-screen w-[300px] hidden md:block rounded-tr-[16px] rounded-br-[16px]'
      aria-hidden='true'
    />
  )

  return <ClientOnly fallback={placeholder}>{() => <AppSidebar />}</ClientOnly>
}

export function AppSidebar() {
  return (
    <>
      <SidebarStyles />
      <SidebarProvider
        style={
          {
            '--sidebar-width': '300px',
            '--sidebar-width-icon': '92px',
          } as React.CSSProperties
        }
      >
        <SidebarContents />
      </SidebarProvider>
      <TabBar />
      <MobileTabBar />
      <div className='md:hidden h-[90px]'></div>
    </>
  )
}
