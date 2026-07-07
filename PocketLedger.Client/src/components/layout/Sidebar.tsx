import { useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { setSidebarOpen } from '../../app/uiSlice';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cn } from '../../lib/utils';
import {
  HomeIcon,
  BanknotesIcon,
  ArrowPathIcon,
  FolderIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  BellIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Wallets', href: '/wallets', icon: BanknotesIcon },
  { name: 'Accounts', href: '/accounts', icon: BanknotesIcon },
  { name: 'Transactions', href: '/transactions', icon: ArrowPathIcon },
  { name: 'Categories', href: '/categories', icon: FolderIcon },
  { name: 'Budgets', href: '/budgets', icon: ChartBarIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const sidebarRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isAdmin = user?.roles?.includes('Admin');

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      closeButtonRef.current?.focus();
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') dispatch(setSidebarOpen(false));
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMobile, sidebarOpen, dispatch]);

  useEffect(() => {
    if (isMobile) dispatch(setSidebarOpen(false));
  }, [location.pathname, isMobile, dispatch]);

  if (isMobile && !sidebarOpen) return null;

  return (
    <>
      {isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => dispatch(setSidebarOpen(false))}
          aria-hidden="true"
        />
      )}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-sidebar text-sidebar transition-all duration-300',
          isMobile ? 'w-64' : sidebarOpen ? 'w-64' : 'w-20'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between p-4">
          {(!isMobile || sidebarOpen) && (
            <h1 className="text-xl font-bold">
              {isMobile || sidebarOpen ? 'PocketLedger' : 'PL'}
            </h1>
          )}
          {isMobile && (
            <button
              ref={closeButtonRef}
              onClick={() => dispatch(setSidebarOpen(false))}
              className="text-sidebar hover:opacity-80"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
        </div>

        <nav className="mt-8 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => isMobile && dispatch(setSidebarOpen(false))}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-sidebar-hover text-white' : 'text-white/70 hover:bg-sidebar-hover hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {(isMobile || sidebarOpen) && <span>{item.name}</span>}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-3 border-t border-white/10" aria-hidden="true" />
              <Link
                to="/urlAdmin26"
                onClick={() => isMobile && dispatch(setSidebarOpen(false))}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  location.pathname.startsWith('/urlAdmin26')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-white/70 hover:bg-sidebar-hover hover:text-white'
                )}
                aria-current={location.pathname.startsWith('/urlAdmin26') ? 'page' : undefined}
              >
                <ShieldCheckIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {(isMobile || sidebarOpen) && <span>Admin Panel</span>}
              </Link>
            </>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full',
              'text-white/70 hover:bg-destructive/80 hover:text-white'
            )}
            aria-label="Sign out"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            {(isMobile || sidebarOpen) && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
