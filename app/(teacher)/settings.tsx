import { ScreenShell } from '@/components/navigation/ScreenShell';
import PortalSettingsScreen from '@/components/portal/PortalSettingsScreen';
import React from 'react';

export default function TeacherSettingsScreen() {
  return (
    <ScreenShell role="teacher" title="Settings" showBack showMenu>
      <PortalSettingsScreen role="teacher" />
    </ScreenShell>
  );
}
