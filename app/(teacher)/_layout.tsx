import { RoleDrawerContent } from '@/components/navigation/RoleDrawerContent';
import { RoleRouteGuard } from '@/components/RoleRouteGuard';
import { Drawer } from 'expo-router/drawer';

export default function TeacherDrawerLayout() {
  return (
    <RoleRouteGuard expectedRole="teacher">
      <Drawer
        drawerContent={(props) => <RoleDrawerContent {...props} role="teacher" />}
        screenOptions={{
          headerShown: false,
          drawerStyle: { width: 280 },
        }}
      />
    </RoleRouteGuard>
  );
}
