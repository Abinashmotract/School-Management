import { useAppSelector } from '@/store/hooks';
import { useAppTheme } from '@/providers/AppThemeProvider';
import { useEffect } from 'react';

export function RoleThemeSync() {
  const role = useAppSelector((state) => state.auth.role);
  const { setRole } = useAppTheme();

  useEffect(() => {
    setRole(role);
  }, [role, setRole]);

  return null;
}
