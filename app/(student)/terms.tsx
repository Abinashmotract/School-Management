import { DrawerSubHeader } from '@/components/navigation/DrawerSubHeader';
import { LegalPage } from '@/components/screens/shared/LegalPage';
import React from 'react';
import { View } from 'react-native';

export default function StudentTermsScreen() {
  return (
    <View style={{ flex: 1 }}>
      <DrawerSubHeader title="Terms & Conditions" />
      <LegalPage
        title="Terms of use"
        paragraphs={[
          'By using SchoolApp you agree to follow school policies and acceptable use rules.',
          'Accounts are provided for educational purposes. Misuse may result in access being revoked.',
          'Content and marks are indicative; official records are maintained by the school.',
        ]}
      />
    </View>
  );
}
