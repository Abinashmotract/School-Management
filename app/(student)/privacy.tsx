import { ScreenShell } from '@/components/navigation/ScreenShell';
import { LegalPage } from '@/components/screens/shared/LegalPage';
import React from 'react';

export default function StudentPrivacyScreen() {
  return (
    <ScreenShell role="student" title="Privacy Policy" showBack showMenu>
      <LegalPage
        paragraphs={[
          'We collect only the information needed to run school services such as attendance, fees, and messaging.',
          'Data is shared with authorized school staff and is not sold to third parties.',
          'Contact your school administrator to request corrections or account deletion.',
        ]}
      />
    </ScreenShell>
  );
}
