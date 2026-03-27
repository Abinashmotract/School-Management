import { RoleDrawerContent } from '@/components/navigation/RoleDrawerContent';
import { Drawer } from 'expo-router/drawer';

export default function StudentDrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <RoleDrawerContent {...props} role="student" />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: 280 },
      }}
    />
  );
}
