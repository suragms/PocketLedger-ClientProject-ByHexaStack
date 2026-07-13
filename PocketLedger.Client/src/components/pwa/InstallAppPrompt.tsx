import { useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

interface InstallAppPromptProps {
  variant?: 'banner' | 'inline';
  onDismiss?: () => void;
}

export default function InstallAppPrompt({ variant = 'banner', onDismiss }: InstallAppPromptProps) {
  const { canInstall, isInstalled, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || !canInstall || dismissed) return null;

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Install PocketLedger</p>
          <p className="text-xs text-muted-foreground mt-0.5">Add to your home screen for the best experience</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
          <Button size="sm" onClick={install}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
            Install
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg"
      >
        <div className="relative flex items-center gap-3 rounded-xl border bg-card p-4 shadow-lg">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <ArrowDownTrayIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Install PocketLedger</p>
            <p className="text-xs text-muted-foreground mt-0.5">Get the app for quick access</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" onClick={install}>
              Install
            </Button>
            <button
              onClick={() => {
                setDismissed(true);
                onDismiss?.();
              }}
              className="rounded-lg p-1.5 hover:bg-muted transition-colors"
              aria-label="Dismiss"
            >
              <XMarkIcon className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
