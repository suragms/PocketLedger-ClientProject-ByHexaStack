import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

interface RoleGuardProps {
  children: ReactNode;
  roles: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export default function RoleGuard({ children, roles, fallback, redirectTo = '/' }: RoleGuardProps) {
  const { user } = useAppSelector((state) => state.auth);
  const hasRole = user?.roles?.some((role) => roles.includes(role)) ?? false;

  if (hasRole) return <>{children}</>;
  if (fallback) return <>{fallback}</>;
  return <Navigate to={redirectTo} replace />;
}
