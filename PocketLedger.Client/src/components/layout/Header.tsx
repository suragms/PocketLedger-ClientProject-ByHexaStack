import { Fragment, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { toggleSidebar, toggleDarkMode } from '../../app/uiSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import NotificationBell from '../notifications/NotificationBell';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/accounts': 'Accounts',
  '/wallets': 'Wallets',
  '/transactions': 'Transactions',
  '/transactions/new': 'New Transaction',
  '/categories': 'Categories',
  '/budgets': 'Budgets',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/notifications/preferences': 'Notification Preferences',
  '/settings': 'Settings',
  '/privacy': 'Privacy',
  '/terms': 'Terms of Service',
};

function getMobileTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (/^\/accounts\/\d+\/edit$/.test(pathname)) return 'Edit Account';
  if (/^\/accounts\/\d+$/.test(pathname)) return 'Account Details';
  if (/^\/wallets\/\d+$/.test(pathname)) return 'Wallet Details';
  if (/^\/transactions\/\d+\/edit$/.test(pathname)) return 'Edit Transaction';
  if (/^\/budgets\/new$/.test(pathname)) return 'New Budget';
  if (/^\/budgets\/\d+\/edit$/.test(pathname)) return 'Edit Budget';
  if (/^\/budgets\/\d+$/.test(pathname)) return 'Budget Details';
  return 'PocketLedger';
}

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { darkMode } = useAppSelector((state) => state.ui);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const scrollDirection = useScrollDirection({ threshold: 10 });
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (scrollDirection === 'down' && window.scrollY > 100) {
      setIsCompact(true);
    } else if (scrollDirection === 'up') {
      setIsCompact(false);
    }
  }, [scrollDirection]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) return;
        if (location.pathname.startsWith('/urlAdmin26')) return;
        e.preventDefault();
        navigate('/transactions/new');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, location.pathname]);



  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const compactHeight = 'h-14';
  const fullHeight = 'h-16';
  const headerHeight = isCompact && !isMobile ? compactHeight : fullHeight;

  return (
    <header
      className={`sticky top-0 z-30 flex ${headerHeight} items-center gap-4 border-b bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 px-4 md:px-6 transition-all duration-300`}
    >
      {isMobile ? (
        <>
          <h1 className="flex-1 min-w-0 truncate text-lg font-semibold">
            {getMobileTitle(location.pathname)}
          </h1>

          <NotificationBell />

          <Menu as="div" className="relative">
            <Menu.Button
              className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-muted active:scale-95 transition-transform"
              aria-label="User menu"
            >
              <UserCircleIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border bg-card shadow-lg focus:outline-none">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate('/settings')}
                        className={`${active ? 'bg-muted' : ''} flex w-full items-center gap-2 px-4 py-2.5 text-sm active:scale-[0.98] transition-transform`}
                      >
                        <UserCircleIcon className="h-4 w-4" aria-hidden="true" />
                        Profile Settings
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${active ? 'bg-muted' : ''} flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive active:scale-[0.98] transition-transform`}
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </>
      ) : (
        <>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="flex items-center justify-center w-11 h-11 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex-1" />

          <button
            onClick={() => navigate('/transactions/new?type=0')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 transition-all px-3 py-2 text-sm font-medium min-w-[44px] min-h-[44px] justify-center"
            aria-label="Add Income"
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            <span>Income</span>
          </button>

          <button
            onClick={() => navigate('/transactions/new?type=1')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white active:scale-95 transition-all px-3 py-2 text-sm font-medium min-w-[44px] min-h-[44px] justify-center"
            aria-label="Add Expense"
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            <span>Expense</span>
          </button>

          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="flex items-center justify-center w-11 h-11 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <SunIcon className="h-5 w-5" aria-hidden="true" /> : <MoonIcon className="h-5 w-5" aria-hidden="true" />}
          </button>

          <NotificationBell />

          <Menu as="div" className="relative">
            <Menu.Button
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted active:scale-95 transition-all min-w-[44px] min-h-[44px]"
              aria-label="User menu"
            >
              <UserCircleIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border bg-card shadow-lg focus:outline-none">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate('/settings')}
                        className={`${active ? 'bg-muted' : ''} flex w-full items-center gap-2 px-4 py-2.5 text-sm active:scale-[0.98] transition-transform`}
                      >
                        <UserCircleIcon className="h-4 w-4" aria-hidden="true" />
                        Profile Settings
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${active ? 'bg-muted' : ''} flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive active:scale-[0.98] transition-transform`}
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </>
      )}


    </header>
  );
}
