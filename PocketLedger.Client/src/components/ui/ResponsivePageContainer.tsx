import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const maxWidths = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[96rem]',
  full: 'max-w-full',
};

export default function ResponsivePageContainer({ children, className, maxWidth = 'lg' }: Props) {
  return (
    <div className={cn('mx-auto w-full px-4 md:px-6 lg:px-8', maxWidths[maxWidth], className)}>
      {children}
    </div>
  );
}
