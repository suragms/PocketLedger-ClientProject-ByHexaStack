import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, description, actions, className }: Props) {
  return (
    <div className={cn('flex items-center justify-between flex-wrap gap-3', className)}>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold md:text-3xl truncate">{title}</h1>
        {description && (
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
