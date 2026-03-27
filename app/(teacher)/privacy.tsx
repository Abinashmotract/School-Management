import { DrawerSubHeader } from '@/components/navigation/DrawerSubHeader';
import { LegalPage } from '@/components/screens/shared/LegalPage';
import React from 'react';
import { View } from 'react-native';

export default function TeacherPrivacyScreen() {
  return (
    <View style={{ flex: 1 }}>
      <DrawerSubHeader title="Privacy Policy" />
      <LegalPage
        title="Your privacy"
        paragraphs={[
          'Access to student information is limited to what your role requires for teaching.',
          'Audit logs may be kept for security; contact your administrator for questions.',
        ]}
      />
    </View>
  );
}
