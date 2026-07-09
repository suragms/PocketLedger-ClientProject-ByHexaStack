import type { ReactNode } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export default function MobileOnly({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  if (!isMobile) return null;
  return <>{children}</>;
}
