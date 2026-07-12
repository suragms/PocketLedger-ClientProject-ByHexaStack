import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ArrowPathIcon,
  PlusIcon,
  ChartBarIcon,
  FolderIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import QuickAddSheet from '../transactions/QuickAddSheet';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'History', href: '/transactions', icon: ArrowPathIcon },
  { name: 'Categories', href: '/categories', icon: FolderIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function MobileNav() {
  const location = useLocation();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const scrollDirection = useScrollDirection({ threshold: 10 });

  const isHidden = scrollDirection === 'down' && window.scrollY > 100;

  return (
    <>
      <AnimatePresence>
        {!isHidden && (
          <motion.nav
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 md:hidden"
            aria-label="Mobile navigation"
            style={{ paddingBottom: 'var(--safe-area-bottom)' }}
          >
            <div className="relative flex items-center justify-around pt-1.5 pb-1">
              {navigation.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'relative flex flex-col items-center gap-0.5 px-3 py-2 min-w-[48px] min-h-[48px] justify-center text-xs font-medium rounded-lg transition-colors active:scale-95',
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="relative">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.span
                        layoutId="mobile-nav-indicator"
                        className="absolute -bottom-1 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-primary"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })}

              <button
                onClick={() => setShowQuickAdd(true)}
                className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-[48px] min-h-[48px] justify-center text-xs font-medium transition-colors active:scale-95"
                aria-label="Add transaction"
              >
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 -mt-6"
                >
                  <PlusIcon className="h-6 w-6" aria-hidden="true" />
                </motion.div>
                <span className="text-primary font-semibold">Add</span>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <QuickAddSheet isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
    </>
  );
}
