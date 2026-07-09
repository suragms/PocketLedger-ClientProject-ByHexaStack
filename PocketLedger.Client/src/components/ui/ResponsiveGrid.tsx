import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  children: ReactNode;
  cols?: { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: string;
  className?: string;
}

const colClasses: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
  '4': 'grid-cols-4',
  '5': 'grid-cols-5',
  '6': 'grid-cols-6',
};

export default function ResponsiveGrid({ children, cols = { base: 1, md: 2, lg: 4 }, gap, className }: Props) {
  const classes = [
    cols.base && colClasses[cols.base],
    cols.sm && `sm:${colClasses[cols.sm]}`,
    cols.md && `md:${colClasses[cols.md]}`,
    cols.lg && `lg:${colClasses[cols.lg]}`,
    cols.xl && `xl:${colClasses[cols.xl]}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('grid', classes, gap || 'gap-3 md:gap-4', className)}>
      {children}
    </div>
  );
}
