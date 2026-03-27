import { DrawerSubHeader } from '@/components/navigation/DrawerSubHeader';
import { LegalPage } from '@/components/screens/shared/LegalPage';
import React from 'react';
import { View } from 'react-native';

export default function TeacherTermsScreen() {
  return (
    <View style={{ flex: 1 }}>
      <DrawerSubHeader title="Terms & Conditions" />
      <LegalPage
        title="Terms of use"
        paragraphs={[
          'Teacher accounts are issued by the school for official instructional use.',
          'You agree to protect student data and follow applicable education and privacy regulations.',
        ]}
      />
    </View>
  );
}
