import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useNavigationGuard(isDirty: boolean) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);

    const handlePopState = () => {
      if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handler);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty]);

  const guardedNavigate = useCallback(
    (path: string) => {
      if (isDirty) {
        if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
      }
      navigate(path);
    },
    [isDirty, navigate]
  );

  return { guardedNavigate };
}
