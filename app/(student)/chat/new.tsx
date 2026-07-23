import { ScreenShell } from '@/components/navigation/ScreenShell';
import NewChatScreen from '@/components/chat/NewChatScreen';
import React from 'react';

export default function StudentNewChatScreen() {
  return (
    <ScreenShell role="student" title="New message" showBack showMenu={false}>
      <NewChatScreen role="student" />
    </ScreenShell>
  );
}
