import { RoleDrawerContent } from '@/components/navigation/RoleDrawerContent';
import { createDrawerScreenOptions } from '@/components/navigation/drawerScreenOptions';
import { RoleRouteGuard } from '@/components/RoleRouteGuard';
import { useAppTheme } from '@/providers/AppThemeProvider';
import { Drawer } from 'expo-router/drawer';

export default function ParentDrawerLayout() {
  const { scheme } = useAppTheme();

  return (
    <RoleRouteGuard expectedRole="parent">
      <Drawer
        drawerContent={(props) => <RoleDrawerContent {...props} role="parent" />}
        screenOptions={createDrawerScreenOptions(scheme)}
      />
    </RoleRouteGuard>
  );
}
