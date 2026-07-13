import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiIcon } from '@heroicons/react/24/outline';

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-warning/15 px-4 py-2 text-sm text-warning border-b border-warning/20"
        >
          <WifiIcon className="h-4 w-4 shrink-0" />
          <span>You're offline — showing cached data</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
