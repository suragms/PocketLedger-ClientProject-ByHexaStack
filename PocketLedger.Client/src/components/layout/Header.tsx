import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { toggleSidebar, toggleDarkMode } from '../../app/uiSlice';
import { useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import NotificationBell from '../notifications/NotificationBell';

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { darkMode } = useAppSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex-1" />

      <button
        onClick={() => dispatch(toggleDarkMode())}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <SunIcon className="h-5 w-5" aria-hidden="true" /> : <MoonIcon className="h-5 w-5" aria-hidden="true" />}
      </button>

      <NotificationBell />

      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted">
          <UserCircleIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium hidden md:block">
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
                    className={`${active ? 'bg-muted' : ''} flex w-full items-center gap-2 px-4 py-2 text-sm`}
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
                    className={`${active ? 'bg-muted' : ''} flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive`}
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
    </header>
  );
}
