import { DrawerSubHeader } from '@/components/navigation/DrawerSubHeader';
import { LegalPage } from '@/components/screens/shared/LegalPage';
import React from 'react';
import { View } from 'react-native';

export default function StudentPrivacyScreen() {
  return (
    <View style={{ flex: 1 }}>
      <DrawerSubHeader title="Privacy Policy" />
      <LegalPage
        title="Your privacy"
        paragraphs={[
          'We collect only what is needed to run the school app: profile, attendance, and academic activity.',
          'Data is stored securely and shared only with authorized school staff and guardians as per policy.',
          'You can request corrections through your school administrator.',
        ]}
      />
    </View>
  );
}
