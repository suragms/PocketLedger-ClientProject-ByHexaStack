import type { ReactNode } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export default function DesktopOnly({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  if (!isDesktop) return null;
  return <>{children}</>;
}
