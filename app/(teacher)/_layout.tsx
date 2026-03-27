import { RoleDrawerContent } from '@/components/navigation/RoleDrawerContent';
import { Drawer } from 'expo-router/drawer';

export default function TeacherDrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <RoleDrawerContent {...props} role="teacher" />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: 280 },
      }}
    />
  );
}
