import { ScreenShell } from '@/components/navigation/ScreenShell';
import { LegalPage } from '@/components/screens/shared/LegalPage';
import React from 'react';

export default function ParentPrivacyScreen() {
  return (
    <ScreenShell role="parent" title="Privacy Policy" showBack showMenu>
      <LegalPage
        paragraphs={[
          'We collect only the information needed to share student updates with authorized guardians.',
          'Data is shared with school staff and is not sold to third parties.',
          'Contact your school administrator for data access or deletion requests.',
        ]}
      />
    </ScreenShell>
  );
}
