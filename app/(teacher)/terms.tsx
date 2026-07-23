import { ScreenShell } from '@/components/navigation/ScreenShell';
import { LegalPage } from '@/components/screens/shared/LegalPage';
import React from 'react';

export default function TeacherTermsScreen() {
  return (
    <ScreenShell role="teacher" title="Terms & Conditions" showBack showMenu>
      <LegalPage
        paragraphs={[
          'By using SchoolApp you agree to follow school policies and acceptable use rules.',
          'Staff accounts must be used for authorized school activities only.',
          'Student data must be handled in accordance with school privacy policies.',
        ]}
      />
    </ScreenShell>
  );
}
