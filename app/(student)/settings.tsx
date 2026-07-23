import { ScreenShell } from '@/components/navigation/ScreenShell';
import PortalSettingsScreen from '@/components/portal/PortalSettingsScreen';
import React from 'react';

export default function StudentSettingsScreen() {
  return (
    <ScreenShell role="student" title="Settings" showBack showMenu>
      <PortalSettingsScreen role="student" />
    </ScreenShell>
  );
}
