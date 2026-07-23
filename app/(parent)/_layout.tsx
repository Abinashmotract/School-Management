import { RoleDrawerContent } from '@/components/navigation/RoleDrawerContent';
import { RoleRouteGuard } from '@/components/RoleRouteGuard';
import { Drawer } from 'expo-router/drawer';

export default function ParentDrawerLayout() {
  return (
    <RoleRouteGuard expectedRole="parent">
      <Drawer
        drawerContent={(props) => <RoleDrawerContent {...props} role="parent" />}
        screenOptions={{
          headerShown: false,
          drawerStyle: { width: 280 },
        }}
      />
    </RoleRouteGuard>
  );
}
