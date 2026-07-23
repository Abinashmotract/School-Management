import { ScreenShell } from '@/components/navigation/ScreenShell';
import { LegalPage } from '@/components/screens/shared/LegalPage';
import React from 'react';

export default function StudentTermsScreen() {
  return (
    <ScreenShell role="student" title="Terms & Conditions" showBack showMenu>
      <LegalPage
        paragraphs={[
          'By using SchoolApp you agree to follow school policies and acceptable use rules.',
          'Accounts are provided for educational purposes. Misuse may result in access being revoked.',
          'Content and marks are indicative; official records are maintained by the school.',
        ]}
      />
    </ScreenShell>
  );
}
