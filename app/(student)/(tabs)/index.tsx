import { StudentDashboard } from '@/components/screens/student/StudentDashboard';
import React from 'react';
import { View } from 'react-native';

export default function StudentHomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <StudentDashboard />
    </View>
  );
}
