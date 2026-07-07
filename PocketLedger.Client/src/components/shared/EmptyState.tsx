import type { ReactNode } from 'react';
import Button from '../ui/Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
