import { DrawerSubHeader } from '@/components/navigation/DrawerSubHeader';
import { LegalPage } from '@/components/screens/shared/LegalPage';
import React from 'react';
import { View } from 'react-native';

export default function ParentTermsScreen() {
  return (
    <View style={{ flex: 1 }}>
      <DrawerSubHeader title="Terms & Conditions" />
      <LegalPage
        title="Terms of use"
        paragraphs={[
          'Parent accounts are issued in connection with a student enrolled at a partner school.',
          'You agree to use messaging and data features responsibly and in line with school policies.',
        ]}
      />
    </View>
  );
}
