import { RoleDrawerContent } from '@/components/navigation/RoleDrawerContent';
import { createDrawerScreenOptions } from '@/components/navigation/drawerScreenOptions';
import { RoleRouteGuard } from '@/components/RoleRouteGuard';
import { useAppTheme } from '@/providers/AppThemeProvider';
import { Drawer } from 'expo-router/drawer';

export default function TeacherDrawerLayout() {
  const { scheme } = useAppTheme();

  return (
    <RoleRouteGuard expectedRole="teacher">
      <Drawer
        drawerContent={(props) => <RoleDrawerContent {...props} role="teacher" />}
        screenOptions={createDrawerScreenOptions(scheme)}
      />
    </RoleRouteGuard>
  );
}
