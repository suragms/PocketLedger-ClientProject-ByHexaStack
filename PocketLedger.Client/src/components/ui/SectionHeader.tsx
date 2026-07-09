import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function SectionHeader({ title, description, action, className }: Props) {
  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      <div>
        <h2 className="text-base font-semibold md:text-lg">{title}</h2>
        {description && (
          <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
