import { ParentDashboard } from '@/components/screens/parent/ParentDashboard';
import React from 'react';
import { View } from 'react-native';

export default function ParentHomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ParentDashboard />
    </View>
  );
}
