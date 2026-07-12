import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface SettingsRowProps {
  icon: ReactNode;
  iconBg?: string;
  label: string;
  value?: string;
  subtitle?: string;
  onClick?: () => void;
  toggle?: boolean;
  onToggle?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
}

export function SettingsRow({
  icon,
  iconBg = 'bg-muted',
  label,
  value,
  subtitle,
  onClick,
  toggle,
  onToggle,
  destructive = false,
  disabled = false,
  trailing,
}: SettingsRowProps) {
  const isClickable = !!onClick || !!onToggle;

  return (
    <button
      type="button"
      onClick={onClick || onToggle}
      disabled={disabled || (!onClick && !onToggle)}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
        'first:rounded-t-xl last:rounded-b-xl',
        isClickable && !disabled && 'active:bg-muted/80',
        disabled && 'opacity-50 cursor-not-allowed',
        destructive && 'text-destructive'
      )}
    >
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', iconBg)}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', destructive ? 'text-destructive' : 'text-foreground')}>
          {label}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {trailing}

      {toggle !== undefined && onToggle && (
        <button
          type="button"
          role="switch"
          aria-checked={toggle}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200',
            toggle ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span
            className={cn(
              'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
              toggle ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      )}

      {value && !toggle && (
        <span className="text-sm text-muted-foreground shrink-0">{value}</span>
      )}

      {onClick && !toggle && (
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      )}
    </button>
  );
}

interface SettingsSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ title, children, className }: SettingsSectionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {title && (
        <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="rounded-xl border bg-card divide-y">
        {children}
      </div>
    </div>
  );
}
