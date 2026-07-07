import type { ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle, Description, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, description, children, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <Transition appear show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className={cn('w-full transform rounded-xl bg-card p-6 shadow-xl transition-all', sizes[size])}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {title && <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>}
                    {description && <Description className="mt-1 text-sm text-muted-foreground">{description}</Description>}
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 hover:bg-muted"
                    aria-label="Close dialog"
                  >
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
