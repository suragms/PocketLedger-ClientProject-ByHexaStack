import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BanknotesIcon,
  ArrowPathIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Accounts', href: '/accounts', icon: BanknotesIcon },
  { name: 'Transactions', href: '/transactions', icon: ArrowPathIcon },
  { name: 'Budgets', href: '/budgets', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function MobileNav() {
  const location = useLocation();

  return (
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
      </div>
    </nav>
  );
}
