import { ScreenShell } from '@/components/navigation/ScreenShell';
import PortalSettingsScreen from '@/components/portal/PortalSettingsScreen';
import { RoleColors } from '@/constants/school-theme';
import { syncStudentPush } from '@/lib/student-push';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, Text } from 'react-native';

export default function StudentSettingsScreen() {
  const router = useRouter();
  return (
    <ScreenShell role="student" title="Settings" showBack showMenu>
      <PortalSettingsScreen
        role="student"
        onPushChange={async (enabled) => {
          if (!enabled) return;
          try {
            await syncStudentPush(true);
          } catch (error) {
            Alert.alert('Notifications', error instanceof Error ? error.message : 'Could not register this device.');
          }
        }}
        extraSections={
          <Pressable
            onPress={() => router.push('/(student)/password' as never)}
            style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10 }}
          >
            <Text style={{ fontWeight: '700', color: RoleColors.student.primary }}>Change password</Text>
          </Pressable>
        }
      />
    </ScreenShell>
  );
}
