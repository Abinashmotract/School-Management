import { DrawerSubHeader } from '@/components/navigation/DrawerSubHeader';
import { LegalPage } from '@/components/screens/shared/LegalPage';
import React from 'react';
import { View } from 'react-native';

export default function ParentPrivacyScreen() {
  return (
    <View style={{ flex: 1 }}>
      <DrawerSubHeader title="Privacy Policy" />
      <LegalPage
        title="Your privacy"
        paragraphs={[
          'We process guardian contact details and linked student records as instructed by the school.',
          'You can contact the school for data access or correction requests.',
        ]}
      />
    </View>
  );
}
