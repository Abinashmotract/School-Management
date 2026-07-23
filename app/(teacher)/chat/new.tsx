import { ScreenShell } from '@/components/navigation/ScreenShell';
import NewChatScreen from '@/components/chat/NewChatScreen';
import React from 'react';

export default function TeacherNewChatScreen() {
  return (
    <ScreenShell role="teacher" title="New message" showBack showMenu={false}>
      <NewChatScreen role="teacher" />
    </ScreenShell>
  );
}
