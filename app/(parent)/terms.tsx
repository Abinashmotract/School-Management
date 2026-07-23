import { ScreenShell } from '@/components/navigation/ScreenShell';
import { LegalPage } from '@/components/screens/shared/LegalPage';
import React from 'react';

export default function ParentTermsScreen() {
  return (
    <ScreenShell role="parent" title="Terms & Conditions" showBack showMenu>
      <LegalPage
        paragraphs={[
          'By using SchoolApp you agree to follow school policies and acceptable use rules.',
          'Parent accounts are linked to enrolled students and must be used responsibly.',
          'Official school records take precedence over in-app summaries.',
        ]}
      />
    </ScreenShell>
  );
}
