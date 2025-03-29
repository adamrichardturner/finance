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
    path: '/monzo-auth',
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

  // Updated handleMinimize to remove direct DOM manipulation
  const handleMinimize = () => {
    toggleSidebar()
  }

  // Framer Motion animation variants
  const buttonVariants = {
    initial: {
      backgroundColor: 'transparent',
      borderLeftColor: 'transparent',
      borderLeftWidth: '4px',
    },
    hover: {
      backgroundColor: '#F8F4F0',
      borderLeftColor: '#277C78',
      borderLeftWidth: '4px',
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

  const textVariants = {
    initial: { color: '#B3B3B3' },
    hover: { color: '#201F24' },
    active: { color: '#201F24' },
  }

  // Text animation variants
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
        <SidebarMenu>
          {MENU_ITEMS.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === '/dashboard' && location.pathname === '/')

            return (
              <SidebarMenuItem
                key={item.name}
                className='group w-full flex justify-center'
              >
                <SidebarMenuButton
                  asChild
                  tooltip={item.label}
                  className={`${
                    isCollapsed
                      ? 'flex w-[92px] items-center justify-center p-4 mr-[4px]'
                      : 'flex w-[300px] h-[56px] px-[32px] py-[16px] items-center gap-[16px]'
                  } text-white rounded-r-[12px]`}
                  data-active={isActive}
                >
                  <motion.div
                    initial='initial'
                    whileHover='hover'
                    animate={isActive ? 'active' : 'initial'}
                    variants={buttonVariants}
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      isCollapsed
                        ? 'justify-center items-center w-full'
                        : 'items-center gap-4'
                    } w-full cursor-pointer`}
                  >
                    <Link
                      to={item.path}
                      className={`flex ${
                        isCollapsed
                          ? 'justify-center items-center w-full'
                          : 'items-center gap-4'
                      } w-full cursor-pointer`}
                    >
                      <div className='flex items-center justify-center'>
                        <motion.img
                          src={item.icon}
                          alt={item.label}
                          variants={iconVariants}
                          transition={{ duration: 0.2 }}
                          className={`${isCollapsed ? 'w-[24px] h-[24px]' : 'w-6'}`}
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
                    </Link>
                  </motion.div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContentSection>

      <SidebarFooter className='group/minimize p-0 w-full flex items-center justify-center mb-12'>
        <SidebarMenuItem className='group w-full flex justify-center'>
          <SidebarMenuButton
            asChild
            tooltip='Minimize Menu'
            data-active={false}
            className={`${
              isCollapsed
                ? 'flex w-[92px] items-center justify-center p-4 mr-[4px]'
                : 'flex w-[300px] h-[56px] px-[32px] py-[16px] items-center gap-[16px]'
            } text-white rounded-r-[12px]`}
          >
            <motion.div
              initial='initial'
              whileHover='hover'
              animate='initial'
              variants={buttonVariants}
              transition={{ duration: 0.2 }}
              className={`flex ${
                isCollapsed
                  ? 'justify-center items-center w-full'
                  : 'items-center gap-4'
              } w-full cursor-pointer`}
              onClick={handleMinimize}
            >
              <div
                className={`flex ${
                  isCollapsed
                    ? 'justify-center items-center w-full'
                    : 'items-center gap-4'
                } w-full`}
              >
                <div className='flex items-center justify-center'>
                  <motion.img
                    src='/assets/icons/MinimizeIcon.svg'
                    alt='Minimize Menu'
                    variants={iconVariants}
                    transition={{ duration: 0.2 }}
                    className={`${isCollapsed ? 'w-[24px] h-[24px]' : 'w-6'}`}
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
            </motion.div>
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
      <div className='md:hidden h-[68px]'></div>
    </>
  )
}
