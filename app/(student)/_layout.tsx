import { RoleDrawerContent } from '@/components/navigation/RoleDrawerContent';
import { RoleRouteGuard } from '@/components/RoleRouteGuard';
import { Drawer } from 'expo-router/drawer';

export default function StudentDrawerLayout() {
  return (
    <RoleRouteGuard expectedRole="student">
      <Drawer
        drawerContent={(props) => <RoleDrawerContent {...props} role="student" />}
        screenOptions={{
          headerShown: false,
          drawerStyle: { width: 280 },
        }}
      />
    </RoleRouteGuard>
  );
}
