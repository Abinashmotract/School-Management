import { ScreenShell } from '@/components/navigation/ScreenShell';
import PortalCommunicationScreen from '@/components/portal/PortalCommunicationScreen';
import React from 'react';

export default function StudentEventsScreen() {
  return (
    <ScreenShell role="student" title="Events" showBack showMenu>
      <PortalCommunicationScreen role="student" mode="events" />
    </ScreenShell>
  );
}
