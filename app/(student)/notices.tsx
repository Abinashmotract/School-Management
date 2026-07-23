import { ScreenShell } from '@/components/navigation/ScreenShell';
import PortalCommunicationScreen from '@/components/portal/PortalCommunicationScreen';
import React from 'react';

export default function StudentNoticesScreen() {
  return (
    <ScreenShell role="student" title="Notices" showBack showMenu>
      <PortalCommunicationScreen role="student" mode="notices" />
    </ScreenShell>
  );
}
