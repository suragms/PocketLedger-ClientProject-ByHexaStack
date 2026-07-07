import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import Button from '../ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    warning: 'bg-warning text-white hover:bg-warning/90',
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  };

  return (
    <Transition appear show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-xl bg-card p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" className="text-lg font-semibold leading-6">
                  {title}
                </DialogTitle>
                {description && (
                  <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                )}
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose} disabled={loading}>
                    {cancelLabel}
                  </Button>
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${variantStyles[variant]} disabled:opacity-50`}
                    aria-label={confirmLabel}
                  >
                    {loading ? 'Processing...' : confirmLabel}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
