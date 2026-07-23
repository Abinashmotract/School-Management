import { ScreenShell } from '@/components/navigation/ScreenShell';
import { LegalPage } from '@/components/screens/shared/LegalPage';
import React from 'react';

export default function TeacherPrivacyScreen() {
  return (
    <ScreenShell role="teacher" title="Privacy Policy" showBack showMenu>
      <LegalPage
        paragraphs={[
          'We collect staff profile and activity data required for school operations.',
          'Student information is accessible only for assigned classes and duties.',
          'Contact your school administrator for privacy-related requests.',
        ]}
      />
    </ScreenShell>
  );
}
