import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { setSidebarOpen, toggleDarkMode } from '../../app/uiSlice';
import { logout } from '../../features/auth/authSlice';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cn } from '../../lib/utils';
import {
  HomeIcon,
  UsersIcon,
  ArrowPathIcon,
  FolderIcon,
  BanknotesIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChartPieIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const adminNav = [
  { name: 'Dashboard', href: '/urlAdmin26', icon: HomeIcon },
  { name: 'Users', href: '/urlAdmin26/users', icon: UsersIcon },
  { name: 'Transactions', href: '/urlAdmin26/transactions', icon: ArrowPathIcon },
  { name: 'Categories', href: '/urlAdmin26/categories', icon: FolderIcon },
  { name: 'Wallets', href: '/urlAdmin26/wallets', icon: BanknotesIcon },
  { name: 'Budgets', href: '/urlAdmin26/budgets', icon: ChartBarIcon },
  { name: 'Reports', href: '/urlAdmin26/reports', icon: DocumentTextIcon },
  { name: 'Analytics', href: '/urlAdmin26/analytics', icon: ChartPieIcon },
  { name: 'Notifications', href: '/urlAdmin26/notifications', icon: BellIcon },
  { name: 'Audit Logs', href: '/urlAdmin26/audit-logs', icon: ShieldCheckIcon },
  { name: 'System Logs', href: '/urlAdmin26/system-logs', icon: Cog6ToothIcon },
  { name: 'Roles', href: '/urlAdmin26/roles', icon: ShieldCheckIcon },
  { name: 'Settings', href: '/urlAdmin26/settings', icon: Cog6ToothIcon },
];

export default function AdminLayout() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { darkMode } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (isMobile && !sidebarOpen) return null;

  return (
    <div className="min-h-screen bg-background">
      {isMobile && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => dispatch(setSidebarOpen(false))} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full bg-sidebar text-sidebar transition-all duration-300 flex flex-col',
        isMobile ? 'w-64' : sidebarOpen ? 'w-64' : 'w-20'
      )}>
        <div className="flex items-center justify-between p-4">
          {(!isMobile || sidebarOpen) && (
            <Link to="/urlAdmin26" className="flex items-center gap-2">
              <span className="text-lg font-bold">PL</span>
              {(isMobile || sidebarOpen) && <span className="text-lg font-bold">Admin</span>}
            </Link>
          )}
          {isMobile && (
            <button onClick={() => dispatch(setSidebarOpen(false))} className="text-sidebar hover:opacity-80">
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        <nav className="flex-1 mt-4 space-y-1 px-3 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/urlAdmin26' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => isMobile && dispatch(setSidebarOpen(false))}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-sidebar-hover text-white' : 'text-white/70 hover:bg-sidebar-hover hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {(isMobile || sidebarOpen) && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-sidebar-hover hover:text-white transition-colors">
            <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
            {(isMobile || sidebarOpen) && <span>Back to App</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-h-screen transition-all duration-300" style={{ marginLeft: isMobile ? 0 : sidebarOpen ? 256 : 80 }}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6">
          <div className="flex-1" />
          <button onClick={() => dispatch(toggleDarkMode())} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2 text-sm">
            <UserCircleIcon className="h-5 w-5 text-muted-foreground" />
            <span className="hidden md:block">{user?.firstName} {user?.lastName}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">Admin</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-destructive">
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
