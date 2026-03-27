import { RoleDrawerContent } from '@/components/navigation/RoleDrawerContent';
import { Drawer } from 'expo-router/drawer';

export default function ParentDrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <RoleDrawerContent {...props} role="parent" />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: 280 },
      }}
    />
  );
}
