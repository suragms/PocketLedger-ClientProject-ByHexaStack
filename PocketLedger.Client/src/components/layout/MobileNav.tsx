import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ArrowPathIcon,
  PlusIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import QuickAddSheet from '../transactions/QuickAddSheet';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'History', href: '/transactions', icon: ArrowPathIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function MobileNav() {
  const location = useLocation();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden" aria-label="Mobile navigation">
        <div className="flex items-center justify-around py-1 safe-area-pb">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 min-w-[48px] min-h-[48px] justify-center text-xs font-medium transition-colors rounded-lg',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-[48px] min-h-[48px] justify-center text-xs font-medium transition-colors"
            aria-label="Add transaction"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg -mt-5">
              <PlusIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-primary font-semibold">Add</span>
          </button>
        </div>
      </nav>
      <QuickAddSheet isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
    </>
  );
}
